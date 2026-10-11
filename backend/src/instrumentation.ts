export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startHourlyRegistrationNotifier } = await import("@/lib/hourly-notifier");
    startHourlyRegistrationNotifier();
  }
}
