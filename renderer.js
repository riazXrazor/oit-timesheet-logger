const moment = require("moment");
const request = require("superagent");
const datepicker = require("js-datepicker");
const loginurl =
  "https://lvs9yg3zyh.execute-api.us-east-1.amazonaws.com/dev/login";
let agent = request.agent();
let payload = {},
  form,
  html,
  projectsList = "",
  logtypeList = "",
  worktypeList = "",
  timeList = "";
const picker = datepicker(document.getElementById("date"), {
  formatter: (input, date, instance) => {
    input.value = moment(date).format("YYYY-MM-DD");
  },
  dateSelected: moment().toDate(),
  maxDate: moment().toDate(),
  minDate: moment()
    .subtract(5, "days")
    .toDate()
});

$("#last-entry").text(window.localStorage.getItem("lastLoggedDate") || "---");
setInterval(function() {
  if (online()) {
    if ($("#connection-status i").hasClass("offline"))
      $("#connection-status i").removeClass("offline");
    $("#connection-status i").addClass("online");
  } else {
    if ($("#connection-status i").hasClass("online"))
      $("#connection-status i").removeClass("online");
    $("#connection-status i").addClass("offline");
  }
}, 1000);

if (
  window.localStorage.getItem("username") &&
  window.localStorage.getItem("password")
) {
  $("#email").val(window.localStorage.getItem("username"));
  $("#password").val(window.localStorage.getItem("password"));
  login();
  //console.log("direct login");
} else {
  $("#dashboard").addClass("hide");
  $("#loading").addClass("hide");
  $("#login").removeClass("hide");
}

$("#submit").on("click", login);

$("#submitlog").on("click", function() {
  if (
    !$("#date").val() ||
    !$("#project").val() ||
    $("#time").val() == 0 ||
    !$("#logtype").val() ||
    !$("#worktype").val() ||
    !$("#desc")
      .val()
      .trim()
  ) {
    $.notify("Please fill all the fields!!", "error");
    return;
  }

  const url = "https://timesheet.inadev.net/timesheet";
  let thisBtn = $("#submitlog");
  let thisVal = thisBtn.text();
  thisBtn.text("Submitting...").attr("disabled", true);
  agent
    .get(url)
    .then(res => {
      // console.log(res.text)
      html = $(res.text);

      if (html.find("#add_log_entries_form").length) {
        payload = {};
        form = html.find("#add_log_entries_form");
        form.find("input").map(function() {
          payload[$(this).attr("name")] = $(this).val();
        });
        form.find("select").map(function() {
          payload[$(this).attr("name")] = $(this).val();
        });

        // console.log(payload);

        /*form_build_id: "form-TOrsNVLPOq1YCtNvL1RNiHQshjUg0Bzwff1rn3bE67o"
                    form_id: "hrms_log_effort_add_log_form"
                    form_token: "PvvlX604SyE1bfi4cUcr0Viopi8U50dtCuTj7ui4XwI"
                    leave_type_0: ""
                    log_date[date]: "2019-10-17"
                    log_hours_0: "28800"
                    log_type_0: "16"
                    op: "Submit"
                    project_0: "234665"
                    work_type_0: "23"*/

        payload["log_date[date]"] = $("#date").val();
        // payload['log_date[date]'] = '2019-10-19'
        payload["project_0"] = $("#project").val();
        payload["log_hours_0"] = $("#time").val();
        payload["log_type_0"] = $("#logtype").val();
        payload["work_type_0"] = $("#worktype").val();
        payload["leave_type_0"] = "";
        payload["description_0"] = $("#desc").val();
        // console.log(payload);
        // return;
        return agent.post(url).send(payload);
      } else {
        throw Error("Unable to Log, please login again !!");
      }
    })
    .then(res => {
      thisBtn.text(thisVal).attr("disabled", false);
      window.localStorage.setItem("lastLoggedDate", $("#date").val());
      $.notify("Timesheet Logged Successful !!", "success");
    })
    .catch(e => {
      thisBtn.text(thisVal).attr("disabled", false);
      $.notify(e.message, "error");
    });
});

function login() {
  let email = $("#email").val();
  let password = $("#password").val();

  if (!email.trim() || !password.trim()) {
    $.notify("Username/password required", "error");
    return;
  }

  let thisBtn = $("#submit");
  let txt = thisBtn.text();

  thisBtn.text("Signing...").attr("disabled", true);

  agent = request.agent();
  agent
    .post(loginurl)
    .send({
      username: email,
      password: password
    })
    .then(res => {
      thisBtn.text(txt).attr("disabled", false);
      $("#email").val("");
      $("#password").val("");

      // this.text("Signing...").attr('disabled',true);
      window.localStorage.setItem("name", res.body.name);
      window.localStorage.setItem("email", res.body.email);
      window.localStorage.setItem("username", email);
      window.localStorage.setItem("password", password);
      window.localStorage.setItem("login-data", true);
      projectsList = res.body.projectsList.map(
        o => `<option value="${o.value}">${o.text}</option>`
      );
      logtypeList = res.body.logtypeList.map(
        o => `<option value="${o.value}">${o.text}</option>`
      );
      worktypeList = res.body.worktypeList.map(
        o => `<option value="${o.value}">${o.text}</option>`
      );
      timeList = res.body.timeList.map(
        o => `<option value="${o.value}">${o.text}</option>`
      );
      loadDashboard();
    })
    .catch(err => {
      console.log(err);
      thisBtn.text(txt);
      $.notify("Invalid username/password", "error");
    });
}

$("#email,#password").keyup(function(e) {
  let code = e.keyCode;
  if (code == 13) {
    login();
  }
});

$("#logout").click(function() {
  logout();
});

$("#worktype").change(function() {});

$("#calander").click(function() {
  agent
    .get("https://timesheet.inadev.net/timesheet/calendar")
    .then(res => {
      //   var html = $(res.text);
      //   html("#sidebar-wrapper").css("display", "none");
      //   html("#sidebar-wrapper").css("display", "none");
      //   html("#page-content-wrapper > .container-fluid > .row").css(
      //     "display",
      //     "none"
      //   );
      //   console.log(html("html").html());
      let modal = window.open("", "modal");
      modal.document.write(res.text);
    })
    .catch(_e => {});
});

function logout() {
  window.localStorage.removeItem("login-data");
  window.localStorage.removeItem("username");
  window.localStorage.removeItem("password");
  window.localStorage.removeItem("name");
  window.localStorage.removeItem("email");

  $("#dashboard").addClass("hide");
  $("#login").removeClass("hide");
}

function online() {
  return navigator.onLine;
}

function loadDashboard() {
  //   console.log(projectsList);
  let name = window.localStorage.getItem("name");

  //console.log(name);
  $(".user-name").html(name);
  $("#project").html(projectsList);
  $("#logtype").html(logtypeList);
  $("#worktype").html(worktypeList);
  $("#time").html(timeList);
  $("#login").addClass("hide");
  $("#loading").addClass("hide");
  $("#dashboard").removeClass("hide");

  // let user = getLocalData().user;
  // timerInstance.addEventListener('secondsUpdated', function (e) {
  //     let s = timerInstance.getTimeValues().toString().split(':');
  //     let second = s.pop();
  //     $('.time').html(s.join(":"));

  //     let project = $("#project").val();

  //     let identifer = moment().format("YYYYMMDD")+'-'+user.id+'-'+project;
  //     //console.log(s);
  //     window.localStorage.setItem(identifer,JSON.stringify(s));

  //     let countVal = window.localStorage.getItem('count-'+identifer);
  //     if(!countVal)
  //     {
  //         window.localStorage.setItem('count-'+identifer,1)
  //     }
  //     else
  //     {
  //         countVal = parseInt(countVal);
  //         countVal += 1;
  //         if(countVal >= sendToServer)
  //         {
  //             sendDataToServer({
  //                 date : moment().format('YYYY-MM-DD'),
  //                 description : $("#data-desc").val(),
  //                 end_time : moment().format('HH:mm'),
  //                 project : $("#data-project").val(),
  //                 start_time : moment().subtract(countVal, 'seconds').format('HH:mm')
  //             })
  //             window.localStorage.removeItem('count-'+identifer);
  //         }
  //         else
  //         {
  //             window.localStorage.setItem('count-'+identifer,countVal);
  //             $('.small-time').text(second);
  //         }
  //     }

  // });

  // })
  // .catch(function(e){
  //     $.notify(e.responseJSON.status.message, "error")
  //     logout();
  // });
}
