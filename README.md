This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

Project use [pnpm](https://pnpm.io/). If you don't have it yet, get pnpm first by running the command below.

```bash
npm install -g pnpm
```

Install dependencies:

```bash
pnpm install
```

You need to set up Mapbox token in your env file to be able to run the application locally. Save your token in `.env` as `NEXT_PUBLIC_MAPBOX_TOKEN`.

```.env
NEXT_PUBLIC_MAPBOX_TOKEN=YOUR_MAPBOX_TOKEN
```

After installing dependencies and setting up Mapbox token, run the development server:

```bash
pnpm dev
```

Open http://localhost:3000/ with your browser to see the result.

### Build

The command below will build the website.

```
pnpm run build
```

The command below will build the production version of website, with base path defined. 

```
pnpm run build-prod
```

## Configuration

### Website Name and Description

Edit `src/config/website.ts` to change the website title and description:

```ts
export const WEBSITE_TITLE = "Proenergia + IEP";
export const WEBSITE_DESC = "Proenergia";
```

### Base Path

Edit `NEXT_PUBLIC_BASE_PATH` variable in `build-prod` command that you can find from package.json


```ts
...
"build-prod": "NEXT_PUBLIC_BASE_PATH=/app next build --webpack && rm -rf .out-tmp && mv out .out-tmp && mkdir out && mv .out-tmp out/app",
...
```

## Learn More

To learn more about the framework this project is using Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
