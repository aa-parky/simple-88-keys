document.querySelectorAll(".tab-group").forEach((group) => {
  const buttons = group.querySelectorAll(".tab-btn");
  const contents = group.querySelectorAll(".tab-content");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tabId = btn.dataset.tab;

      // Update active button within this group
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      // Show/hide content in this group
      contents.forEach((content) => {
        content.classList.toggle("hidden", content.dataset.tab !== tabId);
      });
    });
  });

  // Optionally show the first tab by default
  if (buttons.length) {
    buttons[0].classList.add("active");
    contents[0].classList.remove("hidden");
  }
});
