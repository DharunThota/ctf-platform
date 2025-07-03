import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const formData = await req.text()

  // Step 1: Send POST to Flask backend
  const initialRes = await fetch('https://sqli-challenge-production.up.railway.app/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData,
    redirect: 'manual', // so we can manually handle redirect
  })

  const location = initialRes.headers.get('Location')
  const setCookie = initialRes.headers.get('set-cookie')

  // Step 2: If redirected, follow manually with cookie
  let finalHtml: string
  if (location && setCookie) {
    const finalRes = await fetch(`https://sqli-challenge-production.up.railway.app${location}`, {
      headers: {
        Cookie: setCookie,
      },
    })
    finalHtml = await finalRes.text()
  } else {
    // No redirect — just return original response
    finalHtml = await initialRes.text()
  }

  // Step 3: Return HTML to frontend
  return new Response(finalHtml, {
    status: 200,
    headers: {
      'Content-Type': 'text/html',
    },
  })
}
