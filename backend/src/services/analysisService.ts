import { ExtendedProductInfo, AnalysisResult } from "../types"
import { analysisWeights } from "../data/categoryData"

import demandAnalyzer from "../analyzers/demandAnalyzer"
import priceAnalyzer from "../analyzers/priceAnalyzer"
import competitionAnalyzer from "../analyzers/competitionAnalyzer"
import monopolyAnalyzer from "../analyzers/monopolyAnalyzer"
import priceCollapseAnalyzer from "../analyzers/priceCollapseAnalyzer"
import reviewDefectAnalyzer from "../analyzers/reviewDefectAnalyzer"
import adDependencyAnalyzer from "../analyzers/adDependencyAnalyzer"
import homogeneityAnalyzer from "../analyzers/homogeneityAnalyzer"
import survivalRateAnalyzer from "../analyzers/survivalRateAnalyzer"

export function analyzeProduct(product: ExtendedProductInfo): AnalysisResult {
  const demand = demandAnalyzer.analyze(product)
  const pricing = priceAnalyzer.analyze(product)
  const competition = competitionAnalyzer.analyze(product)
  const monopoly = monopolyAnalyzer.analyze(product)
  const priceCollapse = priceCollapseAnalyzer.analyze(product)
  const reviewDefect = reviewDefectAnalyzer.analyze(product)
  const adDependency = adDependencyAnalyzer.analyze(product)
  const homogeneity = homogeneityAnalyzer.analyze(product)
  const survivalRate = survivalRateAnalyzer.analyze(product)

  const dims = { demand, pricing, competition, monopoly, priceCollapse, reviewDefect, adDependency, homogeneity, survivalRate }
  const overallScore = calculateOverallScore(dims)
  const vetoResult = applyVetoRules(dims)
  const conclusion = vetoResult.vetoed ? "not_recommended" : determineConclusion(overallScore, monopoly.score)

  const { warnings, warningsEn } = generateWarnings(dims, vetoResult)
  const { recommendations, recommendationsEn } = generateRecommendations(conclusion, dims)

  return {
    conclusion,
    overallScore: vetoResult.vetoed ? Math.min(overallScore, 39) : overallScore,
    dimensions: dims,
    warnings,
    warningsEn,
    recommendations,
    recommendationsEn,
  }
}

function calculateOverallScore(d: any): number {
  return Math.round(
    d.demand.score * analysisWeights.demand +
    d.pricing.score * analysisWeights.pricing +
    d.competition.score * analysisWeights.competition +
    d.monopoly.score * analysisWeights.monopoly +
    d.priceCollapse.score * analysisWeights.priceCollapse +
    d.reviewDefect.score * analysisWeights.reviewDefect +
    d.adDependency.score * analysisWeights.adDependency +
    d.homogeneity.score * analysisWeights.homogeneity +
    d.survivalRate.score * analysisWeights.survivalRate
  )
}

function applyVetoRules(d: any): { vetoed: boolean; reason: string; reasonEn: string } {
  if (d.monopoly.score < 20) return { vetoed: true, reason: "VETO:MONOPOLY", reasonEn: "VETO:MONOPOLY" }
  if (d.priceCollapse.score < 20) return { vetoed: true, reason: "VETO:PRICE", reasonEn: "VETO:PRICE" }
  if (d.survivalRate.score < 15) return { vetoed: true, reason: "VETO:SURVIVAL", reasonEn: "VETO:SURVIVAL" }
  if (d.reviewDefect.score < 25 && d.reviewDefect.level === "critical") return { vetoed: true, reason: "VETO:QUALITY", reasonEn: "VETO:QUALITY" }
  return { vetoed: false, reason: "", reasonEn: "" }
}

function determineConclusion(overallScore: number, monopolyScore: number): AnalysisResult["conclusion"] {
  if (overallScore >= 75 && monopolyScore >= 60) return "highly_recommended"
  if (overallScore >= 60 && monopolyScore >= 40) return "recommended"
  if (overallScore >= 45) return "neutral"
  return "not_recommended"
}

function generateWarnings(d: any, vetoResult: { vetoed: boolean; reason: string }) {
  const warnings: string[] = []
  const warningsEn: string[] = []
  if (vetoResult.vetoed) { warnings.push(vetoResult.reason); warningsEn.push(vetoResult.reason) }
  if (d.monopoly.level === "critical" || d.monopoly.level === "high") { warnings.push("WARN:MONOPOLY"); warningsEn.push("WARN:MONOPOLY") }
  if (d.priceCollapse.level === "critical" || d.priceCollapse.level === "high") { warnings.push("WARN:PRICE"); warningsEn.push("WARN:PRICE") }
  if (d.reviewDefect.level === "critical" || d.reviewDefect.level === "high") { warnings.push("WARN:QUALITY"); warningsEn.push("WARN:QUALITY") }
  if (d.adDependency.level === "critical" || d.adDependency.level === "high") { warnings.push("WARN:ADS"); warningsEn.push("WARN:ADS") }
  if (d.homogeneity.level === "critical" || d.homogeneity.level === "high") { warnings.push("WARN:HOMOGENEITY"); warningsEn.push("WARN:HOMOGENEITY") }
  if (d.survivalRate.level === "critical" || d.survivalRate.level === "high") { warnings.push("WARN:SURVIVAL"); warningsEn.push("WARN:SURVIVAL") }
  return { warnings, warningsEn }
}

function generateRecommendations(conclusion: string, d: any) {
  const recommendations: string[] = []
  const recommendationsEn: string[] = []
  const add = (key: string) => { recommendations.push(key); recommendationsEn.push(key) }
  if (conclusion === "highly_recommended") {
    add("REC:HIGHLY_1"); add("REC:HIGHLY_2")
    if (d.monopoly.score >= 80) add("REC:HIGHLY_3")
    if (d.pricing.score >= 80) add("REC:HIGHLY_4")
  } else if (conclusion === "recommended") {
    add("REC:REC_1"); add("REC:REC_2")
    if (d.competition.score < 60) add("REC:REC_3")
    if (d.adDependency.score < 60) add("REC:REC_4")
  } else if (conclusion === "neutral") {
    add("REC:NEUTRAL_1"); add("REC:NEUTRAL_2")
    if (d.monopoly.score < 60) add("REC:NEUTRAL_3")
    if (d.priceCollapse.score < 60) add("REC:NEUTRAL_4")
  } else {
    add("REC:NOT_1"); add("REC:NOT_2")
    if (d.monopoly.score < 40) add("REC:NOT_3")
    if (d.survivalRate.score < 40) add("REC:NOT_4")
  }
  return { recommendations, recommendationsEn }
}
