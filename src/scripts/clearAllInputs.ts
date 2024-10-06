export default () => {
  const forms: HTMLFormElement[] = Array.from(
    document.querySelectorAll("form"),
  );

  forms.forEach((form) => form.reset());

  const inputs: HTMLInputElement[] = Array.from(
    document.querySelectorAll("input[type='text']"),
  );

  inputs.concat(Array.from(document.querySelectorAll("input[type='email']")));
  inputs.concat(
    Array.from(document.querySelectorAll("input[type='password']")),
  );

  inputs.forEach((element) => (element.value = ""));

  const editables: HTMLElement[] = Array.from(
    document.querySelectorAll("[contenteditable='true'][role='textbox']"),
  );

  editables.forEach((editable) => (editable.textContent = ""));
};
