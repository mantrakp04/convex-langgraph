import * as jose from "jose";

export async function createJwt(args: {
  key: string,
  value: string,
  userId?: string,
  skipTimestamp?: boolean,
  jwtPrivateKey: string,
}): Promise<string> {
  const privateKey = await jose.importPKCS8(args.jwtPrivateKey, "RS256");

  const jwtBuilder = new jose.SignJWT({
    key: args.key,
    value: args.value,
  })
    .setProtectedHeader({ alg: "RS256" })
    .setSubject(args.userId ?? "public");

  if (args.skipTimestamp === false) {
    jwtBuilder.setIssuedAt();
  }

  const jwt = await jwtBuilder.sign(privateKey);

  return jwt;
}

export async function verifyJwt(
  token: string,
  jwks: string,
): Promise<{ sub: string; key: string; value: string }> {
  const jwksJson = JSON.parse(jwks);
  const jwksSet = jose.createLocalJWKSet(jwksJson);

  const { payload } = await jose.jwtVerify(token, jwksSet, {
    algorithms: ["RS256"],
  });

  if (
    typeof payload.sub !== "string" ||
    typeof payload.key !== "string" ||
    typeof payload.value !== "string"
  ) {
    throw new Error("Invalid JWT payload");
  }

  return {
    sub: payload.sub,
    key: payload.key,
    value: payload.value,
  };
}
