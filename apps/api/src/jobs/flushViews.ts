import cron from "node-cron";

import { flushFormViews } from "../services/analytics.service";
import { redis } from "../lib/redis";

const VIEWS_PREFIX = "form:views:";

async function flushAllViews(): Promise<void> {
  let cursor = "0";

  do {
    let result: [string, string[]];
    try {
      result = await redis.scan(cursor, "MATCH", `${VIEWS_PREFIX}*`, "COUNT", 100);
    } catch {
      return;
    }

    cursor = result[0];
    const keys = result[1];

    for (const key of keys) {
      const formId = key.replace(VIEWS_PREFIX, "");
      let viewCount = 0;

      try {
        const count = await redis.get(key);
        viewCount = Number(count ?? 0);
        if (viewCount > 0) {
          await flushFormViews(formId, viewCount);
          await redis.del(key);
        }
      } catch {
        // Skip failed keys
      }
    }
  } while (cursor !== "0");
}

export function startFlushViewsJob(): cron.ScheduledTask {
  return cron.schedule("*/5 * * * *", () => {
    void flushAllViews();
  });
}
