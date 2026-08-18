function initCustomSelects() {
  document.querySelectorAll('.custom-select').forEach(select => {
    const trigger = select.querySelector('.custom-select-trigger');
    const options = select.querySelectorAll('.custom-select-option');
    const hiddenInput = select.parentElement.querySelector('input[type="hidden"]');
    const textSpan = trigger.querySelector('.custom-select-text');
    const iconSpan = trigger.querySelector('.custom-select-icon');

    trigger.addEventListener('click', event => {
      event.stopPropagation();
      document.querySelectorAll('.custom-select.open').forEach(openSelect => {
        if (openSelect !== select) {
          openSelect.classList.remove('open');
        }
      });
      select.classList.toggle('open');
    });

    options.forEach(option => {
      option.addEventListener('click', () => {
        const value = option.dataset.value;
        const icon = option.querySelector('i').outerHTML;
        const text = option.textContent.trim();

        select.dataset.value = value;
        if (hiddenInput) {
          hiddenInput.value = value;
        }
        textSpan.textContent = text;
        iconSpan.innerHTML = icon;

        options.forEach(item => item.classList.remove('selected'));
        option.classList.add('selected');
        select.classList.remove('open');
      });
    });
  });
}

function initNumberInputs() {
  document.querySelectorAll('.number-btn').forEach(button => {
    button.addEventListener('click', () => {
      const wrapper = button.closest('.number-input-wrapper');
      const input = wrapper.querySelector('input[type="number"]');
      const min = parseInt(input.min, 10) || 1;
      const max = parseInt(input.max, 10) || 50;
      let value = parseInt(input.value, 10) || min;

      if (button.dataset.action === 'increment' && value < max) {
        input.value = value + 1;
      } else if (button.dataset.action === 'decrement' && value > min) {
        input.value = value - 1;
      }
    });
  });
}

function initClickOutside() {
  document.addEventListener('click', () => {
    document.querySelectorAll('.custom-select.open').forEach(select => {
      select.classList.remove('open');
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initCustomSelects();
  initNumberInputs();
  initClickOutside();
});
