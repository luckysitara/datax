"use client"

import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"
import { sankey, sankeyLinkHorizontal } from "d3-sankey"
import { Skeleton } from "@/components/ui/skeleton"

// Define data structure
interface SankeyNode {
  name: string
}

interface SankeyLink {
  source: number
  target: number
  value: number
}

interface SankeyData {
  nodes: SankeyNode[]
  links: SankeyLink[]
}

export function StakeFlowSankey() {
  const svgRef = useRef<SVGSVGElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [data, setData] = useState<SankeyData>({
    nodes: [],
    links: [],
  })

  useEffect(() => {
    const fetchStakeFlowData = async () => {
      try {
        setIsLoading(true)

        // In a real implementation, we would fetch this data from an API
        // For now, we'll use realistic data based on actual Solana liquid staking protocols

        // Create nodes for the Sankey diagram
        const nodes: SankeyNode[] = [
          { name: "Native SOL" },
          { name: "mSOL" },
          { name: "stSOL" },
          { name: "bSOL" },
          { name: "jitoSOL" },
          { name: "Marinade" },
          { name: "Lido" },
          { name: "Jito" },
          { name: "Solblaze" },
        ]

        // Create links with realistic values
        // These values represent millions of SOL
        const links: SankeyLink[] = [
          { source: 0, target: 5, value: 22.5 }, // Native SOL to Marinade
          { source: 0, target: 6, value: 18.3 }, // Native SOL to Lido
          { source: 0, target: 7, value: 12.7 }, // Native SOL to Jito
          { source: 0, target: 8, value: 9.2 }, // Native SOL to Solblaze
          { source: 5, target: 1, value: 22.5 }, // Marinade to mSOL
          { source: 6, target: 2, value: 18.3 }, // Lido to stSOL
          { source: 7, target: 4, value: 12.7 }, // Jito to jitoSOL
          { source: 8, target: 3, value: 9.2 }, // Solblaze to bSOL
          { source: 1, target: 0, value: 6.8 }, // mSOL to Native SOL (unstaking)
          { source: 2, target: 0, value: 4.2 }, // stSOL to Native SOL (unstaking)
          { source: 3, target: 0, value: 2.5 }, // bSOL to Native SOL (unstaking)
          { source: 4, target: 0, value: 3.1 }, // jitoSOL to Native SOL (unstaking)
        ]

        setData({ nodes, links })
        setError(null)
      } catch (err) {
        console.error("Error generating stake flow data:", err)
        setError(err instanceof Error ? err : new Error("Unknown error"))
      } finally {
        setIsLoading(false)
      }
    }

    fetchStakeFlowData()
  }, [])

  useEffect(() => {
    if (!svgRef.current || isLoading || data.nodes.length === 0) return

    const svg = d3.select(svgRef.current)
    const width = svg.node()?.getBoundingClientRect().width || 800
    const height = 400

    // Clear previous content
    svg.selectAll("*").remove()

    // Color scale for the nodes
    const colorScale = d3
      .scaleOrdinal()
      .domain(["Native SOL", "mSOL", "stSOL", "bSOL", "jitoSOL", "Marinade", "Lido", "Jito", "Solblaze"])
      .range(["#14F195", "#9945FF", "#00C2FF", "#F99A37", "#19083D", "#9945FF", "#00C2FF", "#19083D", "#F99A37"])

    // Create the Sankey generator
    const sankeyGenerator = sankey()
      .nodeWidth(15)
      .nodePadding(10)
      .extent([
        [1, 5],
        [width - 1, height - 5],
      ])

    // Format the data for the Sankey diagram
    const sankeyData = sankeyGenerator(data as any)

    // Add links
    svg
      .append("g")
      .selectAll("path")
      .data(sankeyData.links)
      .enter()
      .append("path")
      .attr("d", sankeyLinkHorizontal())
      .attr("stroke", (d: any) => d3.color(colorScale(d.source.name) as string)?.darker(0.5) as string)
      .attr("stroke-width", (d: any) => Math.max(1, d.width))
      .attr("fill", "none")
      .attr("opacity", 0.5)
      .append("title")
      .text((d: any) => `${d.source.name} → ${d.target.name}: ${d.value}M SOL`)

    // Add nodes
    svg
      .append("g")
      .selectAll("rect")
      .data(sankeyData.nodes)
      .enter()
      .append("rect")
      .attr("x", (d: any) => d.x0)
      .attr("y", (d: any) => d.y0)
      .attr("height", (d: any) => d.y1 - d.y0)
      .attr("width", (d: any) => d.x1 - d.x0)
      .attr("fill", (d: any) => colorScale(d.name) as string)
      .attr("opacity", 0.8)
      .append("title")
      .text((d: any) => `${d.name}: ${d.value}M SOL`)

    // Add node labels
    svg
      .append("g")
      .selectAll("text")
      .data(sankeyData.nodes)
      .enter()
      .append("text")
      .attr("x", (d: any) => (d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6))
      .attr("y", (d: any) => (d.y1 + d.y0) / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", (d: any) => (d.x0 < width / 2 ? "start" : "end"))
      .text((d: any) => d.name)
      .attr("font-size", "10px")
      .attr("fill", "currentColor")
      .attr("pointer-events", "none")
  }, [data, isLoading])

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full" />
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
        <p>Error loading stake flow data. Please try again later.</p>
        <p className="text-sm">{error.message}</p>
      </div>
    )
  }

  return (
    <div className="w-full h-[400px]">
      <svg ref={svgRef} width="100%" height="100%" />
    </div>
  )
}
