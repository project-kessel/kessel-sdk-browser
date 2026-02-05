import { http, HttpResponse } from 'msw';
import { CheckSelfBulkRequest } from '../core/api-client';

  const parseRequestBody = async <T>(request: Request): Promise<T> => {
    return await request.json() as T;
  };

export const handlers = [
  http.post('/api/kessel/v1beta2/checkselfbulk', async ({ request }) => {
    const body = await parseRequestBody<CheckSelfBulkRequest>(request);
    const items = body.items;

    if(!items){
      return HttpResponse.json({
        error: 'Invalid request: items field is required'
      }, { status: 400 });
    }

    // Sample response with mixed permissions
    return HttpResponse.json({
      pairs: items.map((requestItem: any, index: number) => ({
        request: requestItem,
        item: {
          allowed: index % 3 === 0 ? 'ALLOWED_TRUE' :
                  index % 3 === 1 ? 'ALLOWED_FALSE' :
                  'ALLOWED_UNSPECIFIED'
        }
      })),
      consistencyToken: {
        token: 'mock-consistency-token-' + crypto.randomUUID()
      }
    });
  })
];
