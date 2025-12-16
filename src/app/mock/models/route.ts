import data from './data.json'
// This file is mainly to test before backend functionality completes.
// https://nextjs.org/docs/app/guides/backend-for-frontend
export function GET(request: Request) {
  return Response.json(data)
}