const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

// NeuroSignal Web Workstation E2E Automation Suite
// Target: https://ravi123sv.github.io/pdd-project/

async function runLoginAudit() {
  let driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(new chrome.Options().addArguments('--headless'))
    .build();

  try {
    console.log("🚀 Initializing NeuroSignal Web Functional Audit...");

    // 1. Landing Page Handshake
    await driver.get('https://ravi123sv.github.io/pdd-project/');
    await driver.wait(until.titleIs('NeuroSignal'), 10000);
    console.log("✅ Landing Page Verified.");

    // 2. Gateway Navigation
    let enterBtn = await driver.findElement(By.xpath("//button[contains(text(), 'Enter Workstation')]"));
    await enterBtn.click();
    await driver.wait(until.urlContains('/auth/login'), 5000);
    console.log("✅ Authentication Gateway Active.");

    // 3. Tester Quick Access Module (Master Key NS-884920)
    let quickAccess = await driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Tester Quick Access')]")), 10000);
    await quickAccess.click();

    let submitBtn = await driver.findElement(By.xpath("//button[contains(text(), 'Access Clinical Node')]"));
    await submitBtn.click();

    // 4. Dashboard Presence Check
    await driver.wait(until.urlContains('/dashboard'), 15000);
    console.log("✅ Global Dashboard Handshake Successful.");

    // 5. Patient Registry Verification
    await driver.get('https://ravi123sv.github.io/pdd-project/dashboard/patients');
    await driver.wait(until.elementLocated(By.tagName('input')), 10000);
    console.log("✅ Clinical Registry Load Verified.");

  } catch (err) {
    console.error("❌ Selenium Audit Failed:", err);
  } finally {
    await driver.quit();
    console.log("🏁 Web Functional Audit Concluded.");
  }
}

runLoginAudit();
