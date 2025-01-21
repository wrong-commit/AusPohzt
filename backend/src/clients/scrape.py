"""
pip install undetected-chromedriver
"""

# from selenium import webdriver
# from selenium.webdriver.chrome.service import Service
# from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
# from selenium.webdriver.common.by import By
import undetected_chromedriver as uc
from selenium.common import exceptions
from selenium.webdriver.common.by import By
import undetected_chromedriver as uc
from selenium import webdriver
import json
import time

AUSPOST_API = "https://digitalapi.auspost.com.au/"
PROXY = "210.79.30.193:8080"

# Set up Chrome options with DevTools
options = webdriver.ChromeOptions()
# options.add_argument('')
# options.add_argument("--headless")  # Run in headless mode
# options.add_argument("--disable-gpu")  # Disable GPU for headless mode
options.add_argument("--enable-logging")
# options.add_argument("--v=1")
options.set_capability('goog:loggingPrefs', { 'performance': 'ALL' })
options.add_argument('--proxy-server=%s' % PROXY)

# Undetected driver
driver = uc.Chrome(options=options)

# Enable network logs
# capabilities = DesiredCapabilities.CHROME
# capabilities["goog:loggingPrefs"] = {"performance": "ALL"}

# Set up ChromeDriver service
# service = Service('chromedriver.exe')

# # Create WebDriver instance
# driver = webdriver.Chrome(service=service, options=options)

try:
    # Open the target URL
    driver.get("https://auspost.com.au/mypost/track/search")
    time.sleep(5)

    searchInput = driver.find_element(By.CSS_SELECTOR, '[data-testid="SearchBarInput"]') 
    searchInput.send_keys('T2V5503952')
    
    time.sleep(1)
    
    driver.find_element(By.CSS_SELECTOR, '[data-testid="SearchButton"]').click()

    # driver.get("https://auspost.com.au/mypost/track/details/T2V5503952")

    # Wait for the page to load
    time.sleep(20)

    # Fetch network logs
    logs = driver.get_log("performance")

    request_id = None 

    for entry in logs:
        log = json.loads(entry["message"])["message"]
        if log["method"] == "Network.responseReceived":
            url = log["params"]["response"]["url"]
            # url = log["params"]["response"]["url"]
            if AUSPOST_API in url: 
                print(f"API request URL: {url}")
                print(f"API response data: \n")
                print(repr(log["params"]))
                request_id = log["params"]["requestId"]

    if request_id is None: 
        print(f"Selenium did not make an API request to {AUSPOST_API}")
    else:
        log = None
        # Get network requests
        try:
            body = driver.execute_cdp_cmd('Network.getResponseBody',  {'requestId': request_id})
            log = body
        except exceptions.WebDriverException:
            print('response.body is null')

        print(f"BODY:{log}")
finally:
    # Close the WebDriver
    driver.quit()