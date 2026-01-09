import fs from "fs";

if (!fs.existsSync(".env")) {
  fs.copyFileSync(".env.sample", ".env");
}
