import { http, HttpResponse } from 'msw';

export const handlers = [
  http.post('/api/kessel/v1beta2/checkbulk', async ({ request }) => {
    const body = await request.json();
    console.log('Mock handler received request body:', body);
    // const items = body?.items || [];

    // Sample response with mixed permissions
    return HttpResponse.json({
      pairs: [],
      // pairs: items.map((requestItem: any, index: number) => ({
      //   request: requestItem,
      //   item: {
      //     allowed: index % 3 === 0 ? 'ALLOWED_TRUE' :
      //             index % 3 === 1 ? 'ALLOWED_FALSE' :
      //             'ALLOWED_UNSPECIFIED'
      //   }
      // })),
      consistencyToken: {
        token: 'mock-consistency-token-' + crypto.randomUUID()
      }
    });
  })
];
