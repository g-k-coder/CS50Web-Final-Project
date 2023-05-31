document.addEventListener("DOMContentLoaded", function () {
  /* let editor = [];
  try {
    document
      .querySelectorAll(".editor")
      .forEach((field) => {
        let edit = CKEDITOR.ClassicEditor.create(field, CkConfig);  
        editor.push(edit);
      });
  } catch {
    // Do nothing
  } */

  window.onscroll = () => {
    let top = document.querySelector("#backToTop");

    if (window.scrollY) {
      top.style.display = "block";
      top.style.transition = "200ms ease-in";
      top.onclick = () => {
        window.scroll(0, 0);
      };
    } else {
      top.style.transition = "200ms ease-out";
      setTimeout(() => {
        top.style.display = "none";
      }, 190);
    }
  };

  (async () => {
    const response = await fetch("/weather", {
      method: "POST",
      headers: { "X-CSRFToken": getToken() },

      /* 
            Weather API response example
                {
                    "coord":{"lon":15.5553,"lat":45.4929},
                    "weather":[{"id":800,"main":"Clear","description":"clear sky","icon":"01n"}],
                    "base":"stations",
                    "main":{"temp":12.24,"feels_like":11.9,"temp_min":12.24,"temp_max":13.94,"pressure":1016,"humidity":91,"sea_level":1016,"grnd_level":1002},
                    "visibility":10000,
                    "wind":{"speed":0.96,"deg":263,"gust":0.92},
                    "clouds":{"all":10},
                    "dt":1682017511,
                    "sys":{"type":1,"id":6816,"country":"HR","sunrise":1681963457,"sunset":1682012932},
                    "timezone":7200,
                    "id":3198259,
                    "name":"Karlovac",
                    "cod":200
                }
            */
    });
    const result = await response.json();
    data = JSON.parse(result["data"]);
    weather = data["weather"][0]["main"];
    icon = `https://openweathermap.org/img/wn/${data["weather"][0]["icon"]}.png`;
    // Correct representation of the temperature in Celsius
    temperature = Math.round(data["main"]["temp"]) + "\xB0C";
    document.querySelector("#condition").innerHTML = weather;
    document.querySelector("#temperature").innerHTML = temperature;
    document.querySelector("#weatherIcon").setAttribute("src", icon);
  })();

  if (window.location.pathname === "/login") {
    document.querySelectorAll("#registerForm input").forEach((field) => {
      field.oninput = () => {
        checkInput(field);
      };
    });

    document.querySelector('#registerForm button[type="submit"]').onmouseover =
      (event) => {
        (async () => {
          const response = await fetch("/validateCredentials/register", {
            method: "POST",
            headers: { "X-CSRFToken": getToken() },
            body: JSON.stringify({
              username: document.querySelector('#regForm [name="username"]')
                .value,
              email: document.querySelector('#regForm [name="email"]').value,
            }),
          });
          const status = response.ok;
          const result = await response.json();

          // If email and username are valid, go ahead and register the user
          if (status) {
            // Hide the feedback toast if it is showing
            document.querySelector(".toast").className = "toast";
          } else {
            // Display feedback so the user knows if email and/or username are unavailable
            document.querySelector('button[type="submit"]').disabled = true;
            document.querySelector(".toast-body").innerHTML = result.message;
            document.querySelector(".toast").className = "toast show";
          }

          setTimeout(() => {
            document.querySelector('button[type="submit"]').disabled = false;
            document.querySelector(".toast").className = "toast";
          }, 3000);
        })();
      };

    document.querySelector("#regForm").onsubmit = (e) => {
      e.preventDefault();
      (async () => {
        const response = await fetch("/validateCredentials/register", {
          method: "POST",
          headers: { "X-CSRFToken": getToken() },
          body: JSON.stringify({
            username: document.querySelector('#regForm [name="username"]')
              .value,
            email: document.querySelector('#regForm [name="email"]').value,
          }),
        });
        const status = response.ok;
        const result = await response.json();

        // If email and username are valid, go ahead and register the user
        if (status) {
          // Hide the feedback toast if it is showing
          document.querySelector(".toast").className = "toast";
          if (document.querySelectorAll("[data-valid=true]").length === 6)
            document.querySelector("#regForm").submit();
        } else {
          // Display feedback so the user knows if email and/or username are unavailable
          document.querySelector(".toast-body").innerHTML = result.message;
          document.querySelector(".toast").className = "toast show";
        }

        setTimeout(() => {
          document.querySelector(".toast").className = "toast";
        }, 3000);
      })();
    };

    document.querySelector('#loginForm button[type="submit"]').onmouseover =
      () => {
        (async () => {
          const response = await fetch("/validateCredentials/login", {
            method: "POST",
            headers: { "X-CSRFToken": getToken() },
            body: JSON.stringify({
              username: document.querySelector('#logForm [name="username"]')
                .value,
              password: document.querySelector('#logForm [name="password"]')
                .value,
            }),
          });
          const status = response.status === 200 ? true : false;
          const result = await response.json();

          if (status) {
            // Hide the feedback toast if it is showing
            document.querySelector(".toast").className = "toast";
          } else {
            // Display feedback so the user knows if email and/or username are unavailable
            document.querySelector(".toast-body").innerHTML = result.message;
            document.querySelector(
              '#loginForm button[type="submit"]'
            ).disabled = true;
            document.querySelector(".toast").className = "toast show";
          }

          setTimeout(() => {
            document.querySelector(
              '#loginForm button[type="submit"]'
            ).disabled = false;
            document.querySelector(".toast").className = "toast";
          }, 4000);
        })();
      };

    document.querySelector("#logForm").onsubmit = function (e) {
      e.preventDefault();
      (async () => {
        const response = await fetch("/validateCredentials/login", {
          method: "POST",
          headers: { "X-CSRFToken": getToken() },
          body: JSON.stringify({
            username: document.querySelector('#logForm [name="username"]')
              .value,
            password: document.querySelector('#logForm [name="password"]')
              .value,
          }),
        });
        const status = response.status === 200 ? true : false;
        const result = await response.json();

        if (status) {
          // Hide the feedback toast if it is showing
          document.querySelector(".toast").className = "toast";
          document.querySelector("#logForm").submit();
        } else {
          // Display feedback so the user knows if email and/or username are unavailable
          document.querySelector(".toast-body").innerHTML = result.message;
          document.querySelector(".toast").className = "toast show";
        }

        setTimeout(() => {
          document.querySelector(".toast").className = "toast";
        }, 3000);
      })();
    };

    // Toggle between Login and Register
    document.querySelector('[data-redirect="register"]').onclick = () => {
      document.querySelector("#loginForm").style.display = "none";
      document.querySelector("#loginForm form").reset();
      document.querySelector("#registerForm").style.display = "flex";
    };

    document.querySelector('[data-redirect="login"]').onclick = () => {
      document.querySelector("#registerForm").style.display = "none";
      document.querySelector("#registerForm form").reset();
      document.querySelector("#loginForm").style.display = "flex";
    };
  } else if (
    window.location.pathname.startsWith("/news") &&
    !window.location.pathname.includes("article")
  ) {
    if (window.location.pathname !== "/news") {
      let tag = window.location.pathname
        .slice(1)
        .split("/")[1]
        .replace(/(%20)+/gm, " ");

      document
        .querySelector(`[data-tag="${tag}"]`)
        .classList.remove("list-group-item");
      document
        .querySelector(`[data-tag="${tag}"]`)
        .classList.remove("btn-outline-dark");
      document.querySelector(`[data-tag="${tag}"]`).classList.add("btn-dark");

      document.querySelector("li.btn-dark").onclick = () => {
        window.location.href = "/news";
      };
    }

    let newsForm;
    if (document.getElementById("newsForm")) {
      CKEDITOR.ClassicEditor.create(
        document.getElementById("newsForm"),
        CkConfig
      ).then((editor) => {
        newsForm = editor;
      });
    }

    if (document.querySelector(".pagination")) {
      if (window.location.search.includes("page="))
        document.querySelector(
          `.page-item:has(a[href='${window.location.search}'])`
        ).className = "page-item active";
      else
        document.querySelector(`.page-item:has(a[href='?page=1'])`).className =
          "page-item active";

      let pages = document.querySelectorAll(".page-item");

      pages.forEach((page) => {
        page.onclick = () => {
          pages.map((link) => (link.className = "page-item"));

          page.className = "page-item active";
        };
      });
    }

    document.querySelectorAll(".list-group-item").forEach((btn) => {
      btn.onclick = (e) => {
        if (btn.dataset.tag !== undefined)
          window.location.href = `/news/${btn.dataset.tag}`;
      };
    });
  } else if (window.location.pathname.includes("article")) {
    const articleID = window.location.pathname.slice(1).split("/")[2];

    try {
      document.querySelector("#editArticle").onclick = () => {
        document.querySelector("#modifyBtns").style.display = "none";
        const data = document.querySelector(".article-content").innerHTML;
        document.querySelector(
          ".article-content"
        ).innerHTML = `<textarea name="body" cols="40" rows="10" class="editor" id="editForm" style="display: none;"></textarea>
      <div class='d-flex w-100 justify-content-between'>
        <button type="submit" class='btn btn-dark mt-4' id='editedArticle'>Apply changes</button>
        <button class='btn btn-outline-danger mt-4' id='cancelEdit'>
        <span class="material-symbols-outlined m-0">
          cancel
          </span>
          Cancel
        </button>
        </div>`;

        let editForm;
        CKEDITOR.ClassicEditor.create(
          document.getElementById("editForm"),
          CkConfig
        ).then((editor) => {
          editForm = editor;
          editForm.setData(data);
          center(document.querySelector("#editForm"));
        });

        document.querySelector("#cancelEdit").onclick = () => {
          document.querySelector("#modifyBtns").style.display = "flex";
          document.querySelector(".article-content").innerHTML = data;
        };

        document.querySelector("#editedArticle").onclick = (e) => {
          e.preventDefault;
          let content = formatContent(editForm.getData());

          if (!content || content === data) {
            document.querySelector("#modifyBtns").style.display = "flex";
            document.querySelector(".article-content").innerHTML = data;
            return;
          }

          (async () => {
            const response = await fetch("/edit", {
              method: "POST",
              headers: { "X-CSRFToken": getToken() },
              body: JSON.stringify({
                // user = request.user
                id: parseInt(articleID),
                content: content,
              }),
            });
            const status = response.status === 200 ? true : false;
            const result = await response.json();
            document.querySelector(".article-content").innerHTML = content;
            document.querySelector("#modifyBtns").style.display = "flex";
          })();
        };
      };
    } catch {}

    let info = document.querySelector("#current-user");
    
    let commentForm;
    if (document.getElementById("commentForm")) {
      CKEDITOR.ClassicEditor.create(
        document.getElementById("commentForm"),
        CkConfig
      ).then((editor) => {
        commentForm = editor;
      });
      // Validate comment form
      // Async update comment and reply

      document.querySelector("#ck-form").onsubmit = (e) => {
        document.querySelector("#submit-comment").disabled = true;

        /*
         *  1 - Validate the form
         *  2 - Fetch API call to backend
         *  3 - if valid reset the form, else return false
         */

        e.preventDefault();
        let content = formatContent(commentForm.getData());

        if (!content) {
          document.querySelector("#submit-comment").disabled = false;
          return;
        }

        (async () => {
          const response = await fetch("/add", {
            method: "POST",
            headers: { "X-CSRFToken": getToken() },
            body: JSON.stringify({
              // user = request.user
              id: articleID,
              content: content,
            }),
          });
          const status = response.status === 200 ? true : false;
          const result = await response.json();
          commentForm.setData("");
          let newComment = document.createElement("div");
          newComment.classList = "comment mb-5 mt-5 rounded-3";
          newComment.dataset.id = `${result.id}`;

          newComment.innerHTML = `<div class="d-flex flex-row comment-header justify-content-between border-bottom rounded-3 border-dark-subtle">
          <div class="d-flex flex-row align-items-center m-2">
              <img loading="lazy" src="${info.dataset.src}" class="rounded-circle m-2 border border-dark-subtle user-img">
              <div class="fs-4">
              ${info.dataset.name}
              </div>
          </div>
          
          <div class="m-2">
              <small>
                  ${result.time}
              </small>
              <div class="d-flex flex-wrap flex-row justify-content-between mt-1">
                  
                  <button class="reply rounded-2 btn btn-dark p-1" data-id="${result.id}">Reply</button>
                  
                  <div class='fs-5'>
                      <span id='updateReplies-${result.id}'>0</span> replies
                  </div>
              </div>
              
          </div>
      </div>
      <div class="p-4 ck-content">
      ${result.content}
      </div>
  
  <div class="replies" data-id="${result.id}">
  
  </div>`;

          document.querySelector("#comment-feed").prepend(newComment);

          document.querySelector("#submit-comment").disabled = false;
        })();
      };
    }

    document.addEventListener("click", () => {
      document.querySelectorAll("button.reply").forEach((btn) => {
        btn.onclick = () => {
          if (btn.innerHTML === "Reply") {
            try {
              document
                .querySelector("#re-form")
                .parentNode.querySelector("button.reply").innerHTML = "Reply";
              document.querySelector("#re-form").remove();
            } catch {}
            btn.innerHTML = "Hide";
            let comment = document.querySelector(
              `div.comment[data-id="${btn.dataset.id}"]`
            );

            comment.querySelector(".ck-content").insertAdjacentHTML(
              "afterend",
              `<form method="POST" id='re-form' class='${btn.dataset.id}' enctype="multipart/form-data" novalidate>
              <textarea
    
              <textarea id="replyForm"></textarea>
  
              <button type="submit" id='submit-reply' class='btn btn-dark mt-4 mb-2'>Add Reply</button>
            </form>
            </div>`
            );
            let form;
            if (document.getElementById("replyForm")) {
              CKEDITOR.ClassicEditor.create(
                document.getElementById("replyForm"),
                CkConfig
              ).then((editor) => {
                form = editor;
              });
            }
            center(document.querySelector("#re-form"));

            document.querySelector("#re-form").onsubmit = (e) => {
              e.preventDefault();
              document.querySelector("#submit-reply").disabled = true;

              /*
               *  1 - Validate the form
               *  2 - Fetch API call to backend
               *  3 - if valid reset the form, else return false
               */

              e.preventDefault();
              //? <p><br data-cke-filler=true></p> - default CK Editor 5 innerHTML, represents an empty editor
              //
              let content = formatContent(form.getData());

              if (!content) {
                document.querySelector("#submit-reply").disabled = false;
                return;
              }

              form.setData("");
              (async () => {
                const response = await fetch("/reply", {
                  method: "POST",
                  headers: { "X-CSRFToken": getToken() },
                  body: JSON.stringify({
                    // user = request.user
                    id: btn.dataset.id,
                    content: content,
                  }),
                });
                const status = response.status === 200 ? true : false;
                const result = await response.json();

                comment.querySelector(".replies").insertAdjacentHTML(
                  "afterbegin",
                  `<div class="reply-container p-2">
                <div class='d-flex flex-row ml-4 mr-0 border border-dark-subtle rounded-3 justify-content-between'>
                    <div class='d-flex flex-row m-1'>
                        <img loading='lazy'
                              src="${info.dataset.src}"
                              class='rounded-circle m-2 user-img'>
                        <div class='fs-4'>
                            ${info.dataset.name}
                            &raquo;
                            <em><small>reply</small></em>
                        </div>
                    </div>
                    <div class='m-2'>
                        <small>${result.time}</small>
                    </div>
                </div>
                <div class='p-4 ck-content'>${content}</div>
            </div>`
                );
                btn.innerHTML = "Reply";
                document.querySelector(
                  `#updateReplies-${btn.dataset.id}`
                ).innerHTML =
                  parseInt(
                    document.querySelector(`#updateReplies-${btn.dataset.id}`)
                      .innerHTML
                  ) + 1;
                document.querySelector("#submit-reply").disabled = false;
                document.querySelector("#re-form").remove();
                center(comment.querySelector(".replies").lastChild);
                document.body.click();
              })();
              document.querySelector("#re-form").remove();
            };
          } else {
            btn.innerHTML = "Reply";
            document.querySelector("#re-form").remove();
          }
        };
      });
    });
  }
});

function checkInput(field) {
  if (field.getAttribute("name") === "email")
    // Valid email format
    field.dataset.valid = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(
      field.value
    );
  else if (
    field.getAttribute("name") === "password" ||
    field.getAttribute("name") === "confirmation"
  )
    // Password - 6-25 characters, no spaces
    field.dataset.valid = /^([A-Za-z0-9]){6,25}$/.test(field.value);
  else if (field.getAttribute("name") === "username")
    // Username - 4-15 characters, no spaces
    field.dataset.valid = /^([A-Za-z0-9\-\_]){4,15}$/.test(field.value);
  else if (
    field.getAttribute("name") === "first_name" ||
    field.getAttribute("name") === "last_name"
  )
    field.dataset.valid = /^([A-Za-z])+$/.test(field.value);
  else field.dataset.valid = field.value.length > 0 ? true : false;

  document.querySelectorAll("[data-valid=true]").length === 6 &&
  document.querySelector("#regForm [name='password']").value ===
    document.querySelector("#regForm [name='confirmation']").value
    ? (document.querySelector("button").disabled = false)
    : (document.querySelector("button").disabled = true);
}

// Get CSRF Token from cookies
function getToken() {
  const cookie = `; ${document.cookie}`.split(`; csrftoken=`);
  if (cookie.length === 2) return cookie.pop().split(";").shift();
}

function publishArticle(event) {
  //* Article Body - document.querySelector(".ck-editor__editable").innerHTML

  if (
    formatContent(document.querySelector(".ck-editor__editable").innerHTML) &&
    document.querySelector("#id_title").value &&
    document.querySelector("#id_tag").value
  ) {
    return true;
  } else {
    return false;
  }
}

// Trim body, i.e. remove unnecessary whitespace
function formatContent(value) {
  return value
    .replace(/(<p>&nbsp;<\/p>)+$/gm, "")
    .replace(/^(<p>&nbsp;<\/p>)+/gm, "");
}

// Configuration data for CK Editor 5
const CkConfig = {
  toolbar: [
    "heading",
    "|",
    "outdent",
    "indent",
    "|",
    "bold",
    "italic",
    "link",
    "underline",
    "strikethrough",
    "code",
    "subscript",
    "superscript",
    "highlight",
    "|",
    "codeBlock",
    "sourceEditing",
    "insertImage",
    "bulletedList",
    "numberedList",
    "todoList",
    "|",
    "blockQuote",
    "imageUpload",
    "|",
    "fontSize",
    "fontFamily",
    "fontColor",
    "fontBackgroundColor",
    "mediaEmbed",
    "removeFormat",
  ],
  image: {
    toolbar: [
      "imageTextAlternative",
      "|",
      "imageStyle:alignLeft",
      "imageStyle:alignRight",
      "imageStyle:alignCenter",
      "imageStyle:side",
      "|",
    ],
    styles: ["full", "side", "alignLeft", "alignRight", "alignCenter"],
  },
  heading: {
    options: [
      {
        model: "paragraph",
        title: "Paragraph",
        class: "ck-heading_paragraph",
      },
      {
        model: "heading1",
        view: "h1",
        title: "Heading 1",
        class: "ck-heading_heading1",
      },
      {
        model: "heading2",
        view: "h2",
        title: "Heading 2",
        class: "ck-heading_heading2",
      },
      {
        model: "heading3",
        view: "h3",
        title: "Heading 3",
        class: "ck-heading_heading3",
      },
    ],
  },
  htmlEmbed: {
    showPreviews: true,
  },
  fontSize: {
    options: [10, 12, 14, "default", 18, 20, 22],
    supportAllValues: true,
  },
  htmlSupport: {
    allow: [
      {
        name: /.*/,
        attributes: true,
        classes: true,
        styles: true,
      },
    ],
  },
  removePlugins: [
    "CKBox",
    "CKFinder",
    "EasyImage",
    "RealTimeCollaborativeComments",
    "RealTimeCollaborativeTrackChanges",
    "RealTimeCollaborativeRevisionHistory",
    "PresenceList",
    "Comments",
    "TrackChanges",
    "TrackChangesData",
    "RevisionHistory",
    "Pagination",
    "WProofreader",
    "MathType",
    "SlashCommand",
    "Template",
    "DocumentOutline",
    "FormatPainter",
    "TableOfContents",
  ],
};

/* function replyForm(comment) {
  return `<form method="POST" id='re-form' enctype="multipart/form-data" novalidate>
            <textarea
  
            <textarea id="replyForm"></textarea>

            <button type="submit" id='submit-reply' class='btn btn-dark mt-4 mb-2'>Add Reply</button>
          </form>
          </div>`;
} */

function center(e) {
  return e.scrollIntoView({
    behavior: "auto",
    block: "center",
    inline: "center",
  });
}
