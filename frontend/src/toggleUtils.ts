// File: frontend/src/utils.ts

/**
 * Show an element by removing the "hidden" class and update the button text.
 */
export function showElement(
  element: HTMLElement,
  button: HTMLButtonElement,
  hideText: string
) {
  element.classList.remove("hidden");
  button.textContent = hideText;
}

/**
 * Hide an element by adding the "hidden" class and update the button text.
 */
export function hideElement(
  element: HTMLElement,
  button: HTMLButtonElement,
  showText: string
) {
  element.classList.add("hidden");
  button.textContent = showText;
}

/**
 * Toggle an element's visibility by adding or removing the "hidden" class.
 * This is a general helper for cases where there is no need to coordinate with other elements.
 */
export function toggleElement(
  element: HTMLElement,
  button: HTMLButtonElement,
  showText: string,
  hideText: string
) {
  if (element.classList.contains("hidden")) {
    showElement(element, button, hideText);
  } else {
    hideElement(element, button, showText);
  }
}

/**
 * Toggles the visibility of an element using the "hidden" class.
 * If the element is hidden, optionally runs an async action before showing it.
 * 
 * @param element The target element to toggle.
 * @param button The button whose text is updated.
 * @param showText Text to display when the element is hidden.
 * @param hideText Text to display when the element is shown.
 * @param asyncAction Optional async function to run before showing the element.
 */
export async function toggleAsyncVisibility(
  element: HTMLElement,
  button: HTMLButtonElement,
  showText: string,
  hideText: string,
  asyncAction?: () => Promise<void>
) {
  if (element.classList.contains("hidden")) {
    if (asyncAction) {
      button.textContent = "Loading...";
      await asyncAction();
    }
    showElement(element, button, hideText);
  } else {
    hideElement(element, button, showText);
  }
}
/*
toggleAllUsers.addEventListener("click", async () => {
    await toggleAsyncVisibility(
      allUsersResponse,
      toggleAllUsers,
      "Show All Users",
      "Hide All Users",
      fetchUsers
    );
  });
*/

/**
 * Toggles the target form and hides the alternate form.
 */
export function toggleForms(
  targetForm: HTMLElement,
  targetButton: HTMLButtonElement,
  targetShowText: string,
  targetHideText: string,
  alternateForm: HTMLElement,
  alternateButton: HTMLButtonElement,
  alternateShowText: string
) {
  if (!targetForm.classList.contains("hidden")) {
    hideElement(targetForm, targetButton, targetShowText);
  } else {
    showElement(targetForm, targetButton, targetHideText);
    hideElement(alternateForm, alternateButton, alternateShowText);
  }
}
