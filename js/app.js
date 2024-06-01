(function () {
  /**
   * Components to our editor
   */
  const htmlField = document.getElementById("html");
  const cssField = document.getElementById("css");
  const preview = document.getElementById("preview");
  const messagesField = document.getElementById("messages");

  /**
   * Method that gets the values from the textareas
   * and insert to an iframe
   */
  function render() {
    let iframeComponent = preview.contentWindow.document;

    iframeComponent.open();
    iframeComponent.writeln(`
      ${htmlField.innerText}
      <style>${cssField.innerText}</style>`);
    iframeComponent.close();
  }

  /**
   * Create listener to call the render
   * always after a keypress.
   */
  function compile() {
    document.addEventListener("keyup", function () {
      render();
    });

    document.querySelector("#validate").addEventListener("click", function () {
      messagesField.innerText = "Carregando...";
      validateHTML(htmlField.innerText)
        .then((result) => {
          messagesField.innerText = "";

          if (result.messages.length == 0) {
            messagesField.innerHTML = `<div class="success">Parabéns, seu código não possui erros!</div>`;
          } else {
            result.messages?.forEach((error) => {
              messagesField.innerHTML += errorMsg(error);
            });
          }
        })
        .catch((error) => {
          console.error(error);
        });
    });
  }

  function errorMsg(error) {
    return `<div class="${error.type}">linha: ${error.lastLine}: ${error.message
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")}</div>`;
  }

  async function validateHTML(htmlCode) {
    const url = "https://validator.w3.org/nu/?out=json&lang=pt-BR";

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.101 Safari/537.36",
        "Content-Type": "text/html; charset=UTF-8",
      },
      body: htmlCode,
    });

    if (!response.ok) {
      throw new Error(`Erro ao validar HTML: ${response.status}`);
    }

    const result = await response.json(); // Assumindo que a resposta é um texto
    return result;
  }

  compile();
  render();
})();
