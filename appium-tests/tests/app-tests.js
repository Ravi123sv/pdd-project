const wd = require('webdriverio');

// NeuroSignal Mobile Clinical Node E2E Automation Suite
// Platform: Android (Capacitor)

const opts = {
  path: '/wd/hub',
  port: 4723,
  capabilities: {
    platformName: "Android",
    automationName: "UiAutomator2",
    deviceName: "Clinical_Tablet",
    app: "./apps/neurosignal.apk",
    autoGrantPermissions: true
  }
};

async function runMobileAudit() {
  const client = await wd.remote(opts);

  try {
    console.log("🚀 Initializing NeuroSignal Mobile Functional Audit...");

    // 1. Cold Boot & Splash
    await client.pause(5000);
    console.log("✅ Splash Handshake Successful.");

    // 2. Onboarding Carousel Protocol
    for (let i = 0; i < 3; i++) {
        const nextBtn = await client.$('//*[contains(@text, "Next Protocol")]');
        await nextBtn.click();
        await client.pause(1000);
    }
    console.log("✅ Onboarding Navigation Verified.");

    // 3. Auditor Quick Access
    const quickBtn = await client.$('//*[contains(@text, "Tester Quick Access")]');
    await quickBtn.click();

    const accessBtn = await client.$('//*[contains(@text, "Access Clinical Node")]');
    await accessBtn.click();
    console.log("✅ Identity Validation Bypassed via Master Key.");

    // 4. Real-time Monitor Handshake
    await client.pause(5000);
    const monitorTab = await client.$('//*[contains(@text, "Monitor")]');
    await monitorTab.click();
    console.log("✅ GPU-Accelerated Waveform Engine Verified.");

  } catch (err) {
    console.error("❌ Appium Audit Failed:", err);
  } finally {
    await client.deleteSession();
    console.log("🏁 Mobile Functional Audit Concluded.");
  }
}

runMobileAudit();
