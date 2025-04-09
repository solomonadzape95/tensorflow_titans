import { Card, CardContent } from '@/components/ui/card'
import { Users } from 'lucide-react'

const ArchivedGroup = () => {
    return (

        <Card className="rounded-xl transition-all duration-300 border-[#4247704d] bg-[#17192399] p-8 text-center">
            <CardContent className="flex flex-col items-center justify-center space-y-4 p-0">
                <div className="rounded-full bg-muted-foreground/20 p-4">
                    <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-muted">No archived groups</h3>
                <p className="text-sm text-muted-foreground">When you archive groups, they'll appear here</p>
            </CardContent>
        </Card>
    )
}

export default ArchivedGroup