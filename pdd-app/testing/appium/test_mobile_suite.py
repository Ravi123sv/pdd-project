import pytest
from appium import webdriver
from appium.options.android import UiAutomator2Options
from appium.webdriver.common.appiumby import AppiumBy
import time

# APP DETAILS
# Platform: Android (Capacitor)
# App Name: NeuroSignal

@pytest.fixture
def driver():
    options = UiAutomator2Options()
    options.platform_name = 'Android'
    options.device_name = 'Clinical_Handheld'
    options.app = './apps/neurosignal.apk'
    options.auto_grant_permissions = True

    # Appium Server usually runs on localhost:4723
    driver = webdriver.Remote('http://localhost:4723/wd/hub', options=options)
    yield driver
    driver.quit()

class TestMobileClinicalNode:

    def test_app_launch_and_splash(self, driver):
        """MOB-001: Cold boot and splash screen verification"""
        # Wait for splash to disappear
        time.sleep(5)
        # Check if we landed on onboarding or login (based on RootPage logic)
        try:
            el = driver.find_element(AppiumBy.ACCESSIBILITY_ID, "Initialize Workstation")
            assert el.is_displayed()
        except:
            el = driver.find_element(AppiumBy.XPATH, "//*[contains(@text, 'Login')]")
            assert el.is_displayed()

    def test_onboarding_navigation(self, driver):
        """MOB-002: Multi-step onboarding flow"""
        # Navigate through the 3 steps
        for _ in range(3):
            next_btn = driver.find_element(By.XPATH, "//*[contains(@text, 'Next Protocol')]")
            next_btn.click()
            time.sleep(1)

        # Verify landing on Login
        assert driver.find_element(By.XPATH, "//*[contains(@text, 'Identity Validation')]")

    def test_quick_access_mobile(self, driver):
        """MOB-003: Auditor Quick Access on mobile viewport"""
        quick_btn = driver.find_element(AppiumBy.XPATH, "//*[contains(@text, 'Tester Quick Access')]")
        quick_btn.click()

        # Verify input field focus and value
        input_field = driver.find_element(AppiumBy.XPATH, "//android.widget.EditText")
        assert "NS-884920" in input_field.text

        # Submit
        driver.find_element(AppiumBy.XPATH, "//*[contains(@text, 'Access Clinical Node')]").click()
        time.sleep(2)
        assert "Handshake Successful" in driver.page_source

    def test_monitor_performance_touch(self, driver):
        """MOB-004: Touch optimization test for clinical controls"""
        # Navigate to monitor
        driver.get("neurosignal://dashboard/monitor") # Deep link support check

        # Toggle Gain
        gain_btn = driver.find_element(AppiumBy.XPATH, "//*[contains(@text, 'x2')]")
        gain_btn.click()

        # Check for visual response or alert
        # In a real test, we might check signal amplitude shifts if possible via UI tree
        assert gain_btn.is_selected() or "bg-primary" in gain_btn.get_attribute("className")
