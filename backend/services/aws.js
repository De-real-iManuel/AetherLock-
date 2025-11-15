export async function analyzeEscrowRisk(data) {
  return {
    riskScore: 25,
    recommendation: 'low_risk',
    factors: ['verified_kyc', 'reasonable_amount']
  };
}
