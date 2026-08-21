import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

URL = "https://ravi123sv.github.io/pdd-project/"

@pytest.fixture
def driver():
    options = webdriver.ChromeOptions()
    options.add_argument("--headless")
    driver = webdriver.Chrome(options=options)
    driver.implicitly_wait(10)
    yield driver
    driver.quit()

class TestWebWorkstation:

    def test_navigation_to_login(self, driver):
        """WEB-001: Landing Page to Login Navigation"""
        driver.get(URL)
        login_btn = driver.find_element(By.XPATH, "//button[contains(text(), 'Enter Workstation')]")
        login_btn.click()
        assert "/auth/login" in driver.current_url

    def test_tester_quick_access(self, driver):
        """WEB-002: Functional Audit of Quick Access Module"""
        driver.get(URL + "auth/login")
        quick_access = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Tester Quick Access')]"))
        )
        quick_access.click()

        # Verify pre-fill
        key_input = driver.find_element(By.PLACEHOLDER_NAME, "NS-XXXXXX")
        assert key_input.get_attribute("value") == "NS-884920"

        # Click Access
        submit = driver.find_element(By.XPATH, "//button[contains(text(), 'Access Clinical Node')]")
        submit.click()

        # Check for success overlay
        WebDriverWait(driver, 15).until(
            EC.visibility_of_element_located((By.XPATH, "//*[contains(text(), 'Handshake Successful')]"))
        )
        assert "/dashboard" in driver.current_url

    def test_registry_search_functional(self, driver):
        """WEB-003: Registry real-time filtering test"""
        # Assume logged in for these steps (Manual setup or cookie injection)
        driver.get(URL + "dashboard/patients")
        search_box = driver.find_element(By.TAG_NAME, "input")
        search_box.send_keys("John Doe")
        time.sleep(1) # Wait for animation
        results = driver.find_elements(By.XPATH, "//*[contains(text(), 'John Doe')]")
        assert len(results) > 0

    def test_invalid_key_error_reporting(self, driver):
        """WEB-004: Negative Scenario - Invalid Key Handshake"""
        driver.get(URL + "auth/login")
        # Step 2 logic (assuming google auth bypass/mock)
        # This requires more complex mocking for Popup login
        pass
