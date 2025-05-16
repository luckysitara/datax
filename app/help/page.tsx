import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, HelpCircle, Book, MessageCircle, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function HelpPage() {
  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to Dashboard</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Help & Support</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Book className="h-5 w-5" />
              Documentation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Comprehensive guides and documentation for Solana staking.</p>
            <Button variant="outline" className="mt-4 w-full">
              View Docs
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Tutorials
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Video tutorials on how to stake, unstake, and manage your Solana.
            </p>
            <Button variant="outline" className="mt-4 w-full">
              Watch Tutorials
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Community
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Join our community to get help from other Solana stakers.</p>
            <Button variant="outline" className="mt-4 w-full">
              Join Discord
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Contact our support team for personalized assistance.</p>
            <Button variant="outline" className="mt-4 w-full">
              Contact Support
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Common questions about Solana staking</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>What is staking?</AccordionTrigger>
              <AccordionContent>
                Staking is the process of delegating your SOL to validators on the Solana network. By staking, you help
                secure the network and earn rewards in return.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>How do I choose a validator?</AccordionTrigger>
              <AccordionContent>
                When choosing a validator, consider factors such as commission rate, performance score, and risk
                assessment. Our dashboard provides these metrics to help you make an informed decision.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>What are the risks of staking?</AccordionTrigger>
              <AccordionContent>
                The main risks of staking include validator delinquency, slashing (though rare on Solana), and
                opportunity cost. Our security page provides recommendations to minimize these risks.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>How long does it take to unstake?</AccordionTrigger>
              <AccordionContent>
                Unstaking on Solana takes approximately 2-3 days (1 epoch). During this time, your SOL is locked and you
                won't earn rewards.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger>What is the average APY for staking?</AccordionTrigger>
              <AccordionContent>
                The average APY for staking SOL is around 6-7%, but this can vary based on network conditions and
                validator commission rates.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  )
}
