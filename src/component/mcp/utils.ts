import { v } from "convex/values"
import { createJwt } from "../../encryption.js"
import { mutation } from "../_generated/server.js"

export const getAuthToken = async (value: string, jwtPrivateKey: string) => {
  return await createJwt({
    key: "auth_token",
    value,
    jwtPrivateKey,
  })
}

export const getAuthTokenMutation = mutation({
  args: {
    value: v.string(),
    jwtPrivateKey: v.string(),
  },
  handler: async (ctx, args) => {
    return await getAuthToken(args.value, args.jwtPrivateKey);
  },
})
