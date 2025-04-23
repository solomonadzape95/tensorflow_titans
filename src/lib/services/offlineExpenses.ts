
import { Group } from "@/types";

export type GroupMember = {
  user_id: string;
  name: string;
  email: string;
  initials: string;
  avatar_url?: string;
};

export async function initializeDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open("Splitwise Database", 1);

    request.onerror = (event: Event) => {
      const target = event.target as IDBOpenDBRequest;
      console.error("Please allow us to create our DB", target.error);
      reject(target.error);
    };

    request.onsuccess = (event: Event) => {
      const target = event.target as IDBOpenDBRequest;
      if (target) {
        const db = target.result;
        // console.log("Database initialized:", db);
        resolve(db);
      }
    };

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const target = event.target as IDBOpenDBRequest;
      if (target) {
        const db = target.result;
        // console.log("Upgrading database...");

        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains("expenses")) {
          db.createObjectStore("expenses", {
            keyPath: "id",
            autoIncrement: true,
          });
        }
        if (!db.objectStoreNames.contains("groups")) {
          const groupStore = db.createObjectStore("groups", {
            keyPath: "id",
          });
          // Add indices to improve query performance
          groupStore.createIndex("id", "id", { unique: true });
        }
        if (!db.objectStoreNames.contains("group_members")) {
          const membersStore = db.createObjectStore("group_members", {
            keyPath: "id",
            autoIncrement: true,
          });
          // Add indices to improve query performance
          membersStore.createIndex("group_id", "group_id", { unique: false });
          membersStore.createIndex("user_id", "user_id", { unique: false });
          membersStore.createIndex("group_user", ["group_id", "user_id"], {
            unique: true,
          });
        }
        if (!db.objectStoreNames.contains("expense_participants")) {
          const participantsStore = db.createObjectStore(
            "expense_participants",
            {
              keyPath: "id",
              autoIncrement: true,
            }
          );
          // Add indices to improve query performance
          participantsStore.createIndex("expense_id", "expense_id", {
            unique: false,
          });
        }
      }
    };
  });
}

// Updated function to fix the storage of group members
// Updated function to add group members without deleting other groups' members
export async function addGroupData(
  group: Group & {
    group_members: GroupMember[];
  }
) {
  const db = await initializeDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      ["groups", "group_members"],
      "readwrite"
    );

    const groupStore = transaction.objectStore("groups");
    const membersStore = transaction.objectStore("group_members");
    
    // console.log("Adding group with members:", group);
    // console.log("Group members to store:", group.group_members);
    
    // Add or update the group in the "groups" object store
    const groupRequest = groupStore.put({
      id: group.id,
      name: group.name,
      description: group.description,
      expenses: group.expenses,
      balance: group.balance,
      youOwe: group.youOwe,
      settled: group.settled,
      updated_at: new Date().toISOString(), // Add timestamp for sync purposes
    });

    groupRequest.onsuccess = () => {
      // Only delete members associated with THIS group
      const memberIndex = membersStore.index("group_id");
      const membersRequest = memberIndex.getAll(group.id);
      
      membersRequest.onsuccess = () => {
        const existingMembers = membersRequest.result;
        
        // If there are existing members for this group, delete them
        if (existingMembers && existingMembers.length > 0) {
          const deleteRequests = existingMembers.map((member: { id: number; group_id: string; user_id: string }) => {
            return new Promise<void>((resolveDelete, rejectDelete) => {
              const deleteRequest = membersStore.delete(member.id);
              deleteRequest.onsuccess = () => resolveDelete();
              deleteRequest.onerror = (event) => {
                console.error("Error deleting member:", event);
                rejectDelete(event);
              };
            });
          });
          
          Promise.all(deleteRequests)
            .then(() => addNewMembers())
            .catch((error) => {
              console.error("Error deleting existing members:", error);
              reject(error);
            });
        } else {
          // No existing members for this group, just add the new ones
          addNewMembers();
        }
      };
      
      membersRequest.onerror = (event) => {
        console.error("Error getting existing members:", event);
        reject(event);
      };
      
      // Function to add new members
      const addNewMembers = () => {
        if (!group.group_members || group.group_members.length === 0) {
          // console.log("No members to add for group:", group.id);
          resolve(group.id);
          return;
        }
        
        // console.log(`Adding ${group.group_members.length} members for group ${group.id}`);
        
        // Array to track completion of all member additions
        const memberPromises: Promise<void>[] = [];
        
        // Add each member with explicit error handling
        group.group_members.forEach((member) => {
          const memberPromise = new Promise<void>((resolveMember, rejectMember) => {
            try {
              // Create a complete member record
              const memberRecord = {
                group_id: group.id,
                user_id: member.user_id,
                name: member.name || "",
                email: member.email || "",
                initials: member.initials || "",
                avatar_url: member.avatar_url || "",
              };
              
              // console.log("Adding member record:", memberRecord);
              
              const addRequest = membersStore.add(memberRecord);
              
              addRequest.onsuccess = () => {
                // console.log(`Successfully added member ${member.user_id} to group ${group.id}`);
                resolveMember();
              };
              
              addRequest.onerror = (event) => {
                console.error(`Error adding member ${member.user_id}:`, event);
                rejectMember(event);
              };
            } catch (error) {
              console.error("Exception while adding member:", error);
              rejectMember(error);
            }
          });
          
          memberPromises.push(memberPromise);
        });
        
        // Wait for all member additions to complete
        Promise.all(memberPromises)
          .then(() => {
            // console.log(`Successfully added all ${group.group_members.length} members to group ${group.id}`);
            resolve(group.id);
          })
          .catch((error) => {
            console.error("Error adding members:", error);
            reject(error);
          });
      };
    };

    groupRequest.onerror = (event) => {
      console.error("Failed to add/update group data:", event);
      reject(event);
    };
    
    transaction.onerror = (event) => {
      console.error("Transaction failed:", event);
      reject(event);
    };
  });
}

// Function to retrieve all group members across all groups
export async function getAllGroupMembers(): Promise<{[groupId: string]: GroupMember[]}> {
  const db = await initializeDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["group_members"], "readonly");
    const membersStore = transaction.objectStore("group_members");
    const membersRequest = membersStore.getAll();
    
    membersRequest.onsuccess = () => {
      const allMembers = membersRequest.result;
      
      // Group members by group_id
      const membersByGroup: {[groupId: string]: GroupMember[]} = {};
      
      allMembers.forEach((member: GroupMember & { group_id: string }) => {
        if (!membersByGroup[member.group_id]) {
          membersByGroup[member.group_id] = [];
        }
        membersByGroup[member.group_id].push({
          user_id: member.user_id,
          name: member.name,
          email: member.email,
          initials: member.initials,
          avatar_url: member.avatar_url
        });
      });
      
      // console.log("Retrieved all group members:", membersByGroup);
      resolve(membersByGroup);
    };
    
    membersRequest.onerror = (event) => {
      console.error("Failed to retrieve all group members:", event);
      reject(event);
    };
  });
}

// Function to get members of all groups the user belongs to
export async function getAllMyGroupMembers(userId: string): Promise<{[groupId: string]: GroupMember[]}> {
  const db = await initializeDatabase();
  
  return new Promise((resolve, reject) => {
    // First, get all groups the user belongs to
    const transaction = db.transaction(["group_members"], "readonly");
    const membersStore = transaction.objectStore("group_members");
    const userIndex = membersStore.index("user_id");
    const userGroupsRequest = userIndex.getAll(userId);
    
    userGroupsRequest.onsuccess = () => {
      const userGroups = userGroupsRequest.result;
      const groupIds = userGroups.map((group: { group_id: string }) => group.group_id);
      
      if (groupIds.length === 0) {
        resolve({});
        return;
      }
      
      // Now get all members for these groups
      const membersByGroup: {[groupId: string]: GroupMember[]} = {};
      let completedGroups = 0;
      
      groupIds.forEach(groupId => {
        const groupIndex = membersStore.index("group_id");
        const groupMembersRequest = groupIndex.getAll(groupId);
        
        groupMembersRequest.onsuccess = () => {
          const groupMembers = groupMembersRequest.result;
          membersByGroup[groupId] = groupMembers.map((member: { user_id: string; name: string; email: string; initials: string; avatar_url?: string }) => ({
            user_id: member.user_id,
            name: member.name,
            email: member.email,
            initials: member.initials,
            avatar_url: member.avatar_url
          }));
          
          completedGroups++;
          if (completedGroups === groupIds.length) {
            // console.log("Retrieved all members for user's groups:", membersByGroup);
            resolve(membersByGroup);
          }
        };
        
        groupMembersRequest.onerror = (event) => {
          console.error(`Failed to retrieve members for group ${groupId}:`, event);
          reject(event);
        };
      });
    };
    
    userGroupsRequest.onerror = (event) => {
      console.error(`Failed to retrieve groups for user ${userId}:`, event);
      reject(event);
    };
  });
}

// Function to get members of a specific group
export async function getGroupMembersFromIndexedDB(groupId: string): Promise<GroupMember[]> {
  const db = await initializeDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["group_members"], "readonly");
    const membersStore = transaction.objectStore("group_members");
    const memberIndex = membersStore.index("group_id");
    const membersRequest = memberIndex.getAll(groupId);
    
    membersRequest.onsuccess = () => {
      const members = membersRequest.result.map((member: { user_id: string; name: string; email: string; initials: string; avatar_url?: string }) => ({
        user_id: member.user_id,
        name: member.name,
        email: member.email,
        initials: member.initials,
        avatar_url: member.avatar_url
      }));
      
      // console.log(`Retrieved ${members.length} members for group ${groupId}:`, members);
      resolve(members);
    };
    
    membersRequest.onerror = (event) => {
      console.error(`Failed to retrieve members for group ${groupId}:`, event);
      reject(event);
    };
  });
}

// Helper function to verify group members exist in IndexedDB
export async function verifyGroupMembersInDB(groupId: string): Promise<GroupMember[]> {
  const db = await initializeDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["group_members"], "readonly");
    const membersStore = transaction.objectStore("group_members");
    const memberIndex = membersStore.index("group_id");
    const membersRequest = memberIndex.getAll(groupId);
    
    membersRequest.onsuccess = () => {
      const members = membersRequest.result;
      // console.log(`Found ${members.length} members for group ${groupId} in IndexedDB:`, members);
      resolve(members);
    };
    
    membersRequest.onerror = (event) => {
      // console.error(`Failed to verify members for group ${groupId}:`, event);
      reject(event);
    };
  });
}

// Function to retrieve a specific group with its members
export async function getGroupByIdFromIndexedDB(
  groupId: string
): Promise<Group | null> {
  const db = await initializeDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["groups", "group_members"], "readonly");
    const groupStore = transaction.objectStore("groups");
    const groupRequest = groupStore.get(groupId);

    groupRequest.onsuccess = () => {
      const group = groupRequest.result;

      if (!group) {
        resolve(null);
        return;
      }

      const membersStore = transaction.objectStore("group_members");
      const memberIndex = membersStore.index("group_id");
      const membersRequest = memberIndex.getAll(groupId);

      membersRequest.onsuccess = () => {
        const members = membersRequest.result.map(
          (member: {
            user_id: string;
            name: string;
            initials: string;
            email: string;
            avatar_url?: string;
          }) => ({
            id: member.user_id,
            name: member.name,
            initials: member.initials,
            email: member.email,
            avatar_url: member.avatar_url,
          })
        );

        resolve({
          ...group,
          members,
        });
      };

      membersRequest.onerror = (event) => {
        console.error("Failed to retrieve group members:", event);
        reject(event);
      };
    };

    groupRequest.onerror = (event) => {
      console.error("Failed to retrieve group:", event);
      reject(event);
    };
  });
}

// Function to retrieve all group data along with their members
export async function getAllGroupsWithMembers() {
  const db = await initializeDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["groups", "group_members"], "readonly");

    const groupStore = transaction.objectStore("groups");
    const groupRequest = groupStore.getAll();

    groupRequest.onsuccess = async () => {
      const groups = groupRequest.result;
      if (!groups || groups.length === 0) {
        resolve([]);
        return;
      }

      try {
        const groupsWithMembers = await Promise.all(
          groups.map(async (group) => {
            return new Promise((resolveGroup, rejectGroup) => {
              const membersStore = transaction.objectStore("group_members");
              const memberIndex = membersStore.index("group_id");
              const membersRequest = memberIndex.getAll(group.id);

              membersRequest.onsuccess = () => {
                const members = membersRequest.result;
                resolveGroup({
                  ...group,
                  group_members: members,
                  members: members.map(
                    (member: {
                      user_id: string;
                      name: string;
                      initials: string;
                    }) => ({
                      id: member.user_id,
                      name: member.name,
                      initials: member.initials,
                    })
                  ),
                });
              };

              membersRequest.onerror = (event) => {
                console.error(
                  `Failed to retrieve members for group ${group.id}:`,
                  event
                );
                rejectGroup(event);
              };
            });
          })
        );

        // console.log("Retrieved groups with members:", groupsWithMembers);
        resolve(groupsWithMembers);
      } catch (error) {
        // console.error("Error processing groups with members:", error);
        reject(error);
      }
    };

    groupRequest.onerror = (event) => {
      // console.error("Failed to retrieve groups:", event);
      reject(event);
    };
  });
}

