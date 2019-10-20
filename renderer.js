const {ipcRenderer} = require('electron')
const moment = require('moment');
const request = require('superagent');


let agent = request.agent();
let payload = {},form,html,projectsList = '',logtypeList = '',worktypeList = '',timeList = ''

setInterval(function(){
    if(online())
    {
        if($("#connection-status i").hasClass('offline')) $("#connection-status i").removeClass('offline');         
            $("#connection-status i").addClass('online')

    }
    else
    {
        if($("#connection-status i").hasClass('online')) $("#connection-status i").removeClass('online'); 
            $("#connection-status i").addClass('offline')
    }

},1000);

if(window.localStorage.getItem('username') && window.localStorage.getItem('password'))
{
    
    $("#email").val(window.localStorage.getItem('username'))
    $("#password").val( window.localStorage.getItem('password'))
    login();
    console.log("direct login")
} else {
    $("#dashboard").addClass('hide');
    $("#loading").addClass('hide');
    $("#login").removeClass('hide');
}

$(".user-date").text(moment().format('ll'));

    $("#submit").on('click',login);

    $("#submitlog").on('click',function(){

        if(!$("#project").val()||
        ($("#time").val() == 0)||
        !$("#logtype").val()||
        !$("#worktype").val()||
        !$("#desc").val().trim()){
            $.notify("Please fill all the fields!!", "error")
            return;
        }

            const url = 'https://timesheet.inadev.net/timesheet'
            let thisBtn = $("#submitlog");
            let thisVal = thisBtn.text();
            thisBtn.text("Submitting...").attr('disabled',true);
            agent.get(url).then(res => {
            // console.log(res.text)
            html = $(res.text);
       
            if(html.find('#add_log_entries_form').length){
                payload = {};
                form = html.find('#add_log_entries_form')
                form.find('input').map(function(){
                    payload[$(this).attr('name')] = $(this).val();
                });
                form.find('select').map(function(){
                    payload[$(this).attr('name')] = $(this).val();
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
                
                payload['log_date[date]'] = moment().format('YYYY-MM-DD')
                // payload['log_date[date]'] = '2019-10-19'
                payload['project_0'] = $("#project").val();
                payload['log_hours_0'] = $("#time").val();
                payload['log_type_0'] = $("#logtype").val();
                payload['work_type_0'] = $("#worktype").val();
                payload['leave_type_0'] = ''
                payload['description_0'] = $("#desc").val();

                return agent.post(url)
                            .send(payload)

            } else {
                throw Error("Unable to Log, please login again !!")
            }
         })
         .then(res => {
            thisBtn.text(thisVal).attr('disabled',false);
            $.notify("Timesheet Logged Successful !!", "success")
         }).catch(e => {
            thisBtn.text(thisVal).attr('disabled',false);
            $.notify(e.message, "error")
         })

    });

    function login(){

        let email = $("#email").val();
        let password = $("#password").val();

        if(!email.trim() || !password.trim()){
            $.notify("Username/password required", "error")
            return;
        }

        let thisBtn = $("#submit");
        let txt = thisBtn.text();
       

        thisBtn.text("Signing...").attr('disabled',true);
        $.ajax({
            url: "https://timesheet.inadev.net/user/logout",
            dataType: 'text',
            success: function(data) {
                agent = request.agent();
                console.log("logout");
                agent.get("https://timesheet.inadev.net/")
                     .then(res => {
                         
                         html = $(res.text);
                
                        var user = html.find('#textField');
                        var pass = html.find('#passField');
                        var h1 = html.find('input[name="form_build_id"]');
                        var h2 = html.find('input[name="form_id"]');
                        var btn = html.find('#edit-submit');
                        form = html.find("#validationform");
                        payload = {};
                        form.find('input').map(function(){
                            payload[$(this).attr('name')] = $(this).val();
                        });

                        payload[user.attr('name')] = email
                        payload[pass.attr('name')] = password
                        payload[h1.attr('name')] = h1.val();
                        payload[h2.attr('name')] = h2.val();
                        payload[btn.attr('name')] = btn.val();
                        console.log(payload);
                        // return;
                        agent.set('Content-Type','application/x-www-form-urlencoded')
                        return agent.post(form.attr('action'))
                                    .send(payload)
                         
                    })
                    .then(res => {
                        thisBtn.text(txt).attr('disabled',false);
                        $("#email").val("")
                        $("#password").val("")
                        html = $(res.text);
                        if(res.text.includes('My account')){
                            // this.text("Signing...").attr('disabled',true);
                            window.localStorage.setItem('name',html.find('span[class="username"]').text());
                            window.localStorage.setItem('email',html.find('span[class="useremail"]').text());
                            window.localStorage.setItem('username',email)
                            window.localStorage.setItem('password',password)
                            window.localStorage.setItem('login-data',true);
                            projectsList = html.find('#project_0').html();
                            logtypeList = html.find('#log_type_0').html();
                            worktypeList = html.find('#work_type_0').html();
                            timeList = html.find('#log_hour_0').html();
                            loadDashboard();
                        } else {
                            $.notify("Invalid username/password", "error")
                        }
                    })
                    /*.then(res => {
                        // console.log(res.text)
                        html = $(res.text);
                   
                        if(html.find('#add_log_entries_form').length){
                            payload = {};
                            form = html.find('#add_log_entries_form')
                            form.find('input').map(function(){
                                payload[$(this).attr('name')] = $(this).val();
                            });
                            form.find('select').map(function(){
                                payload[$(this).attr('name')] = $(this).val();
                            });

                            // console.log(payload);
                            
                                form_build_id: "form-TOrsNVLPOq1YCtNvL1RNiHQshjUg0Bzwff1rn3bE67o"
                                form_id: "hrms_log_effort_add_log_form"
                                form_token: "PvvlX604SyE1bfi4cUcr0Viopi8U50dtCuTj7ui4XwI"
                                leave_type_0: ""
                                log_date[date]: "2019-10-17"
                                log_hours_0: "28800"
                                log_type_0: "16"
                                op: "Submit"
                                project_0: "234665"
                                work_type_0: "23"
                            
                            payload['log_date[date]'] = '2019-10-17'
                            payload['project_0'] = '234665'
                            payload['log_hours_0'] = '28800'
                            payload['log_type_0'] = '16'
                            payload['work_type_0'] = '23'
                            payload['leave_type_0'] = ''
                            payload['description_0'] = 'Project Work'

                            return agent.post('https://timesheet.inadev.net/timesheet')
                                        .send(payload)

                        } else {
                            throw Error("error")
                        }
                     })
                     .then(res => {
                         console.log('submitted');
                     })*/
                    .catch(err => {
                        thisBtn.text(txt);
                        $.notify(err.message || err, "error")
                    });
        }
    });
       
        /*let email = $("#email").val();
        let password = $("#password").val();
        let txt = $(this).text();
        let that = $(this);

            $.ajax({
                type: 'POST',
                url: "https://codelogicx-crm.track-progress.com/api/auth/login",
                data: {email : email,password: password},
                dataType: "JSON",
                beforeSend: function (xhr) {
                    that.text("Signing...").attr('disabled',true);
                },
                success: function(resultData) { 
                    window.localStorage.setItem('login-data',JSON.stringify(resultData.data));
                    loadDashboard();
                 },
                error: function(e){
                    let err = '';
                    if(e.responseJSON.error_list)
                    {
                        if(e.responseJSON.error_list['email'])
                        {
                            e.responseJSON.error_list['email'].forEach(function(i){
                                err += i+"\n";
                            });
                        }

                        if(e.responseJSON.error_list['password'])
                        {
                            e.responseJSON.error_list['password'].forEach(function(i){
                                err += i+"\n";
                            });
                        }
                    }
                    else
                    {
                        err = e.responseJSON.status.message
                    }


                    $(".form-signin").notify(err, {
                        elementPosition : 'top center',
                        className : 'error'
                    });
                },
                complete : function(){
                    that.text(txt).attr('disabled',false);
                }
            })*/
           
        
    }

    $("#email,#password").keyup(function(e){
        let code = e.keyCode;
        if(code == 13)
        {
            login();
        }
    });

    $("#logout").click(function(){
       logout();
    })

    $("#worktype").change(function(){

       

    });
 

    function logout()
    {
        window.localStorage.removeItem('login-data');
        window.localStorage.removeItem('username');
        window.localStorage.removeItem('password');
        window.localStorage.removeItem('name');
        window.localStorage.removeItem('email');

        $("#dashboard").addClass('hide');
        $("#login").removeClass('hide');
    }


    function online()
    {
        return navigator.onLine;
    }


    function loadDashboard()
    {

        console.log(projectsList);
        let name = window.localStorage.getItem('name');
       
            console.log(name);
            $(".user-name").html(name);
            $("#project").html(projectsList);
            $("#logtype").html(logtypeList);
            $("#worktype").html(worktypeList);
            $("#time").html(timeList);
            $("#login").addClass('hide');
            $("#loading").addClass('hide');
            $("#dashboard").removeClass('hide');


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
