// Test script to verify we can fetch the C2PA trust lists

const TRUST_LIST_URL = 'https://raw.githubusercontent.com/c2pa-org/conformance-public/main/trust-list/C2PA-TRUST-LIST.pem'
const TSA_TRUST_LIST_URL = 'https://raw.githubusercontent.com/c2pa-org/conformance-public/main/trust-list/C2PA-TSA-TRUST-LIST.pem'

export async function testTrustListFetch() {
  console.log('Testing trust list fetch...')

  try {
    console.log('Fetching C2PA-TRUST-LIST.pem...')
    const trustListResponse = await fetch(TRUST_LIST_URL)
    console.log('Status:', trustListResponse.status)
    console.log('Headers:', Object.fromEntries(trustListResponse.headers.entries()))

    const trustListText = await trustListResponse.text()
    console.log('Trust list length:', trustListText.length)
    console.log('First 200 chars:', trustListText.substring(0, 200))

    console.log('\nFetching C2PA-TSA-TRUST-LIST.pem...')
    const tsaResponse = await fetch(TSA_TRUST_LIST_URL)
    console.log('Status:', tsaResponse.status)

    const tsaText = await tsaResponse.text()
    console.log('TSA trust list length:', tsaText.length)
    console.log('First 200 chars:', tsaText.substring(0, 200))

    console.log('\n✅ Both trust lists fetched successfully!')
    return { trustListText, tsaText }
  } catch (error) {
    console.error('❌ Failed to fetch trust lists:', error)
    throw error
  }
}
