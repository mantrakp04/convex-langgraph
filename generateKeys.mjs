import { exportJWK, exportPKCS8, generateKeyPair } from "jose";
import { execSync } from "child_process";
import { join } from "path";

const keys = await generateKeyPair("RS256", {
  extractable: true,
});
const privateKey = await exportPKCS8(keys.privateKey);
const publicKey = await exportJWK(keys.publicKey);
const jwks = JSON.stringify({ keys: [{ use: "sig", ...publicKey }] });

// Change to example directory
process.chdir(join(process.cwd(), "example"));

// Set environment variables using convex env set
try {
  execSync(
    `npx convex env set JWT_PRIVATE_KEY='${privateKey.trimEnd().replace(/\n/g, " ")}'`,
    { stdio: "inherit" }
  );
  execSync(`npx convex env set JWKS='${jwks}'`, { stdio: "inherit" });
  console.log("Environment variables set successfully!");
} catch (error) {
  console.error("Error setting environment variables:", error.message);
  process.exit(1);
}