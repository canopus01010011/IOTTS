/**
 * Hash a password and save it for an existing user (e.g. after manual DB insert).
 *
 * Usage (from backend/):
 *   npx tsx scripts/set-user-password.ts user@example.com MyNewPassword123
 */
import bcrypt from "bcrypt";
import sequelize from "../src/config/database.js";
import User from "../src/models/User.js";

async function main() {
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.error(
      "Usage: npx tsx scripts/set-user-password.ts <email> <password>",
    );
    process.exit(1);
  }

  if (password.length < 6) {
    console.error("Password must be at least 6 characters.");
    process.exit(1);
  }

  await sequelize.authenticate();

  const user = await User.findOne({ where: { email } });
  if (!user) {
    console.error(`No user found with email: ${email}`);
    process.exit(1);
  }



  console.log(`Password updated for ${email} (${user.id}, role: ${user.role})`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
