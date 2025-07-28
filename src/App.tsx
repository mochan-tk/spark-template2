import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Toaster } from '@/components/ui/sonner'
import { Sparkles, Target, Palette, PenTool, Loader2 } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface MarketingResults {
  copy: string
  visualStrategy: string
  targetAudience: string
  productDescription: string
  timestamp: number
}

function App() {
  const [description, setDescription] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [results, setResults] = useKV<MarketingResults | null>('marketing-results', null)
  
  const maxChars = 500
  const remainingChars = maxChars - description.length

  const handleGenerate = async () => {
    if (!description.trim()) {
      toast.error('Please enter a product description')
      return
    }

    if (description.length > maxChars) {
      toast.error(`Description must be under ${maxChars} characters`)
      return
    }

    setIsGenerating(true)
    
    try {
      const prompt = spark.llmPrompt`You are a marketing expert. Based on the following product/service description, provide a comprehensive marketing strategy in the following JSON format:

{
  "copy": "Persuasive and engaging marketing copy for the product/service (2-3 paragraphs)",
  "visualStrategy": "Detailed visual strategy including suggested imagery, colors, design motifs, and overall mood/aesthetic (2-3 paragraphs)", 
  "targetAudience": "Detailed recommendation for the ideal target audience including demographics, psychographics, and behavioral characteristics (2-3 paragraphs)"
}

Product/Service Description: ${description}

Make sure your response is valid JSON with no additional text or formatting.`

      const response = await spark.llm(prompt, 'gpt-4o', true)
      const parsedResults = JSON.parse(response)
      
      const newResults: MarketingResults = {
        copy: parsedResults.copy,
        visualStrategy: parsedResults.visualStrategy, 
        targetAudience: parsedResults.targetAudience,
        productDescription: description,
        timestamp: Date.now()
      }
      
      setResults(newResults)
      toast.success('Marketing strategy generated successfully!')
      
    } catch (error) {
      console.error('Error generating marketing strategy:', error)
      toast.error('Failed to generate marketing strategy. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleNewStrategy = () => {
    setResults(null)
    setDescription('')
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Sparkles size={32} className="text-primary" weight="bold" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">AI-Powered Marketing A</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Transform your product descriptions into comprehensive marketing strategies with AI-generated copy, visual direction, and audience insights.</p>
        </motion.div>

        {/* Input Form */}
        <AnimatePresence mode="wait">
          {!results && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PenTool size={24} className="text-primary" />
                    Describe Your Product or Service
                  </CardTitle>
                  <CardDescription>
                    Provide a brief description of what you're marketing. Include key features, benefits, and what makes it unique.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <Textarea
                      id="product-description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Example: Our eco-friendly water bottles are made from 100% recycled materials. They keep drinks cold for 24 hours and hot for 12 hours, perfect for outdoor enthusiasts and busy professionals who care about sustainability..."
                      className="min-h-32 resize-none text-base"
                      maxLength={maxChars}
                    />
                    <div className="flex justify-between items-center mt-2">
                      <span className={`text-sm ${remainingChars < 50 ? 'text-destructive' : 'text-muted-foreground'}`}>
                        {remainingChars} characters remaining
                      </span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleGenerate}
                    disabled={isGenerating || !description.trim()}
                    size="lg"
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 size={20} className="animate-spin mr-2" />
                        Generating Marketing Strategy...
                      </>
                    ) : (
                      <>
                        <Sparkles size={20} className="mr-2" />
                        Generate Marketing Strategy
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Display */}
        <AnimatePresence>
          {results && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Header with original description and new strategy button */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-2">Marketing Strategy</h2>
                  <p className="text-muted-foreground italic">"{results.productDescription}"</p>
                </div>
                <Button 
                  onClick={handleNewStrategy}
                  variant="outline"
                  className="shrink-0"
                >
                  <Sparkles size={16} className="mr-2" />
                  New Strategy
                </Button>
              </div>

              <div className="grid gap-6">
                {/* Marketing Copy */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <PenTool size={20} className="text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Marketing Copy</CardTitle>
                          <Badge variant="secondary" className="mt-1">Persuasive Content</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none">
                        {results.copy.split('\n\n').map((paragraph, index) => (
                          <p key={index} className="text-foreground leading-relaxed">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Visual Strategy */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-secondary/20 rounded-lg">
                          <Palette size={20} className="text-secondary-foreground" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Visual Strategy</CardTitle>
                          <Badge variant="outline" className="mt-1">Design Direction</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none">
                        {results.visualStrategy.split('\n\n').map((paragraph, index) => (
                          <p key={index} className="text-foreground leading-relaxed">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Target Audience */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-accent/10 rounded-lg">
                          <Target size={20} className="text-accent" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Target Audience</CardTitle>
                          <Badge variant="outline" className="mt-1">Ideal Customers</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none">
                        {results.targetAudience.split('\n\n').map((paragraph, index) => (
                          <p key={index} className="text-foreground leading-relaxed">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App