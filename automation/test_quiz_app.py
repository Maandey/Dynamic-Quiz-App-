import os
import time
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

BASE_URL = "http://127.0.0.1:5500/quiz--app/index.html"
WAIT_SECONDS = 20
SCREENSHOT_DIR = "screenshots"
STEP_DELAY = 2.0  # increase to 5.0 if you want slower
TOTAL_EXPECTED_QUESTIONS = 3
def pause():
    time.sleep(STEP_DELAY)


ANSWER_OPTION_INDEX = 2


def ensure_dir(path: str):
    if not os.path.exists(path):
        os.makedirs(path)


def snap(driver, label: str):
    ensure_dir(SCREENSHOT_DIR)
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = os.path.join(SCREENSHOT_DIR, f"{ts}_{label}.png")
    driver.save_screenshot(filename)
    print(f"[SCREENSHOT] {filename}")


def wait_visible(wait, by, value):
    return wait.until(EC.visibility_of_element_located((by, value)))


def wait_clickable(wait, by, value):
    return wait.until(EC.element_to_be_clickable((by, value)))


def main():
    options = Options()
    
    options.add_argument("--window-size=1280,900")

    driver = webdriver.Chrome(options=options)
    wait = WebDriverWait(driver, WAIT_SECONDS)

    try:
        # STEP 1: Open URL and print URL + title
        driver.get(BASE_URL)
        print("Current URL:", driver.current_url)
        print("Title:", driver.title)
        snap(driver, "01_index_open")
        pause()

        # STEP 2: Click Start Quiz
        start_btn = wait_clickable(wait, By.ID, "startQuizBtn")
        start_btn.click()
        pause()

        # STEP 3: Verify first question appears
        q_el = wait_visible(wait, By.ID, "questionText")
        assert q_el.text.strip() != "", "Question text is empty on Q1!"
        print("Q1:", q_el.text.strip())

        # Verify timer visible
        timer_el = wait_visible(wait, By.ID, "timer")
        assert timer_el.text.strip().isdigit(), "Timer is not numeric!"
        snap(driver, "02_q1_loaded")
        pause()

        # STEP 4: Answer all questions
        for q_num in range(1, TOTAL_EXPECTED_QUESTIONS + 1):
            q_text_el = wait_visible(wait, By.ID, "questionText")
            q_text = q_text_el.text.strip()
            assert q_text != "", f"Question text empty at Q{q_num}"
            print(f"[Q{q_num}] {q_text}")

            snap(driver, f"02_q{q_num}_question_loaded")
            pause()

            options_wrap = wait_visible(wait, By.ID, "options")
            option_buttons = options_wrap.find_elements(By.CSS_SELECTOR, "button.optionBtn")
            assert len(option_buttons) == 4, f"Expected 4 options at Q{q_num}, got {len(option_buttons)}"

            opt = wait_clickable(wait, By.ID, f"option-{ANSWER_OPTION_INDEX}")
            opt.click()
            pause()

            selected = driver.find_elements(By.CSS_SELECTOR, "button.optionBtn.selected")
            assert len(selected) == 1, f"No selected option detected at Q{q_num}"

            snap(driver, f"03_q{q_num}_answered")
            pause()

            if q_num < TOTAL_EXPECTED_QUESTIONS:
               next_btn = wait_clickable(wait, By.ID, "nextBtn")
               assert next_btn.is_enabled(), f"Next button disabled unexpectedly at Q{q_num}"

               progress_before = wait_visible(wait, By.ID, "progress").text.strip()
               next_btn.click()
               pause()

    # Wait until progress changes (e.g., "1 / 3" -> "2 / 3")
               wait.until(lambda d: d.find_element(By.ID, "progress").text.strip() != progress_before)
            else:
                 submit_btn = wait_clickable(wait, By.ID, "submitBtn")
                 submit_btn.click()
                 pause()
                 break

        # STEP 5: Verify results page
        total_score = wait_visible(wait, By.ID, "totalScore").text.strip()
        correct = wait_visible(wait, By.ID, "correctCount").text.strip()
        wrong = wait_visible(wait, By.ID, "wrongCount").text.strip()
        skipped = wait_visible(wait, By.ID, "skippedCount").text.strip()

        # Charts existence
        wait_visible(wait, By.ID, "accuracyChart")
        wait_visible(wait, By.ID, "timeChart")

        print("\nRESULTS:")
        print("Total Score:", total_score)
        print("Correct:", correct)
        print("Incorrect:", wrong)
        print("Skipped:", skipped)

        # Assertions for report credibility
        assert "/" in total_score, "Total score format unexpected (expected like 'x / 10 (yy%)')."
        assert correct.isdigit() and wrong.isdigit() and skipped.isdigit(), "Counts should be numeric."

        snap(driver, "04_results_page")
        print("\n✅ Quiz app Selenium test PASSED")
        pause()
        pause()

    except Exception:
        snap(driver, "ERROR_state")
        raise
    finally:
        driver.quit()


if __name__ == "__main__":
    main()