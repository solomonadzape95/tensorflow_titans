import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function SiteHeader() {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 py-5 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-[20px] font-semibold bg-gradient-to-r from-[#4F32FF] to-[#ff4ecd] bg-clip-text text-transparent ">
          Dashboard
        </h1>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            className="bg-gradient-to-r from-[#4F32FF] to-[#ff4ecd] text-white font-semibold"
          >
            Add Expense
          </Button>
        </div>
      </div>
    </header>
  );
}
