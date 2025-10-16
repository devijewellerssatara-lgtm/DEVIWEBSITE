# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

---

## Backend API and Firestore → PostgreSQL Migration

This project now includes a small Node/Express backend under `server/` that exposes REST endpoints used by the React app to read/update the Current Rates using PostgreSQL instead of Firebase Firestore.

What changed:
- React no longer reads/writes the `rates` document from Firestore.
- Instead, it calls:
  - `GET /api/rates` to fetch current rates
  - `PUT /api/rates` to update rates

### Start the backend

1) Create a PostgreSQL database (default name `jewellery`) and export a connection:
- Either set `DATABASE_URL=postgres://user:pass@host:5432/jewellery`
- Or set individual `PG*` variables. See `server/.env.example`.

2) Install and run the backend:
```
cd server
npm install
cp .env.example .env   # edit values if needed
npm run migrate        # creates the rates table
npm run dev            # starts http://localhost:4000
```

The CRA dev server will proxy `/api/*` to your backend if you add a proxy or run both on the same domain. In development, you can call absolute `http://localhost:4000/api/...` endpoints or configure a proxy in CRA if desired.

### One-off migration from Firestore

If you have an existing Firestore document for rates:

1) Create a Google Cloud service account for your Firebase project and download the JSON key. Set:
```
export GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/serviceAccount.json
```

2) Ensure your Postgres environment variables are set (see above).

3) Run:
```
cd server
npm install
npm run import:firestore
```

This script reads the `rates` document (default ID `GF8lmn4pjyeuqPzA0xDE`) from the `rates` collection and upserts it into the `rates` table. You can override the ID via the `RATES_ID` env var.

### Firebase Storage

Image uploads in the app still use Firebase Storage. If you also want to migrate image storage (e.g., S3 or local), say so and we can add endpoints and integrate a new storage provider.
