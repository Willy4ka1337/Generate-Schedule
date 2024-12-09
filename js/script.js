const socket = io();
let selectedList = 0;
let tabs = [
    `Таблица семестрового расписания занятий`,
    `Панель администрирования данных`
];
let subjects = [];
let listWindow = [];
let forbidDates = [];
let validDays = []
let groups = []
listWindow[0] = `
<div class="sSemester">
    <div class="div12345" style="display: flex;">
        <select name="semester" id="selectSemester">
            <option value="1">1 семестр</option>
            <option value="2">2 семестр</option>
        </select>
        <select name="selkurs" id="selkurs">
            <option value="1">1 курс</option>
            <option value="2">2 курс</option>
            <option value="3">3 курс</option>
            <option value="4">4 курс</option>
        </select>
    </div>
</div>
<div class="cont0">
    <div class="generatedTable"></div>
    <div class="addDate">
        <h2>Запрещенные даты</h2>
        <div class="datelist"></div>
        <button class="deletesubject" onclick="addForbidDate()">Добавить</button>
    </div>
</div>
`;
listWindow[1] = `
<div class="cont0">
    <div class="w1">
        <div class="add">
            <div class="cheader">
                <h1>Добавление предмета</h1>
            </div>
            <div class="ccont">
                <input type="text" id="subject" name="subject" placeholder="Название предмета">
                <input type="number" name="hours" id="hours" placeholder="Количество часов">
                <input type="text" id="teacher" name="teacher" placeholder="Преподаватель">
                <input type="text" name="cabinet" id="cabinet" placeholder="Аудитория">
                <select id="kursss">
                    <option value="1">1 курс</option>
                    <option value="2">2 курс</option>
                    <option value="3">3 курс</option>
                    <option value="4">4 курс</option>
                </select>
                <button class="addsubject" onclick="addSubject()">Добавить</button>
            </div>
        </div>
    </div>
</div>
`;
document.querySelector(`.container`).innerHTML = listWindow[selectedList];
for(let i = 0; i < tabs.length; i++) document.querySelector(`.main > .header`).innerHTML += `<button onclick="changeSelected(${i})" id="list${i}" class="header-button${selectedList == i ? "-active" : ""}">${tabs[i]}</button>`;
socket.emit("getSubjectFromJSON");
socket.emit("getForbidDatesData");
socket.emit("getGroupsData");

function changeSelected(select) {
    selectedList = select;
    for(let i = 0; i < tabs.length; i++) document.querySelector(`.main > .header > #list${i}`).className = `header-button${selectedList == i ? "-active" : ""}`;
    document.querySelector(`.container`).innerHTML = listWindow[selectedList];
    if(selectedList == 0)
    {
        setForbidList();
        addGenerateBtn();
    }
    else if(selectedList == 1)
    {
        setSubjList();
        addGroupList();
        setGroupsList();
    }
}

function addSubject() {
    if(parseInt(document.querySelector('.ccont > #hours').value)%2!=0) return console.log('не делится на 2');
    let newSubject = {
        subject: "",
        hours: 0,
        teacher: "",
        cabinet: "",
        kursss: 0,
        groups: [],
    };
    newSubject.subject = document.querySelector(`#subject`).value;
    newSubject.hours = parseInt(document.querySelector(`#hours`).value);
    newSubject.teacher = document.querySelector(`#teacher`).value;
    newSubject.cabinet = document.querySelector(`#cabinet`).value;
    newSubject.kursss = parseInt(document.querySelector(`#kursss`).value);
    subjects.push(newSubject);
    socket.emit("saveSubjectToJSON", subjects);
    setSubjList();
}

function saveForbidDate(id) {
    forbidDates[id] = document.querySelector(`.main > .container > .cont0 > .addDate > .datelist > #forbidDate${id}`).value
    socket.emit("saveForbidDatesToJSON", forbidDates);
}

function addForbidDate() {
    let len = forbidDates.length
    document.querySelector(`.main > .container > .cont0 > .addDate > .datelist`).innerHTML += `
    <input type="date" name="forbidDate" id="forbidDate${len}" onchange="saveForbidDate(${len})">
    <button class="deleteforbid" onclick="deleteForbidDate(${len})">Удалить</button>`
    if(len > 0) for(let i = 0; i < len; i++) document.querySelector(`.container > .cont0 > .addDate > .datelist > #forbidDate${i}`).value = forbidDates[i];
    forbidDates[len] = document.querySelector(`.container > .cont0 > .addDate > .datelist > #forbidDate${len}`).value
}

function setSubjList() {
    let list = ``
    if(!document.querySelector(`.container > .cont0 > .slist`)) document.querySelector(`.container > .cont0`).innerHTML += `
    <div class="slist">
        <div class="cheader">
            <h1>Список предметов</h1>
        </div>
        <div class="subj-list">
        </div>
        <button class="delete-All-Subject" onclick="deleteSubjectAll()">Удалить все</button>
    </div>`
    for(let i = 0; i < subjects.length; i++) list += `
    <div class="subj">
        <table>
            <tr>
                <td class="tbladd">
                    Предмет: ${subjects[i].subject}
                </td>
            </tr>
            <tr>
                <td class="tbladd">
                    Преподаватель: ${subjects[i].teacher}
                </td>
            </tr>
            <tr>
                <td class="tbladd">
                    Кол-во часов: ${subjects[i].hours}
                </td>
            </tr>
            <tr>
                <td class="tbladd">
                    Аудитория: ${subjects[i].cabinet}
                </td>
            </tr>
            <tr>
                <td class="tbladd">
                    Курс: ${subjects[i].kursss}
                </td>
            </tr>
            <tr>
                <td class="tbladd">
                    <button class="deletesubject" onclick="setGroupsForSubject(${i})">Группы</button>
                </td>
            </tr>
            <tr>
                <td class="tbladd">
                    <button class="deletesubject" onclick="deleteSubject(${i})">Удалить</button>
                </td>
            </tr>
        </table>
    </div>
`
    document.querySelector(`.container > .cont0 > .slist > .subj-list`).innerHTML = list;
}

function setGroupsForSubject(id) {
    let div0 = document.createElement('div')
    div0.className = 'grfsbg'
    document.querySelector('.main').appendChild(div0)

    let div1 = document.createElement('div')
    div1.className = 'grfsc'
    div0.appendChild(div1)

    let closeBtn = document.createElement('button')
    closeBtn.className = 'deletesubject'
    closeBtn.style.position = 'relative'
    closeBtn.style.top = '435px'
    closeBtn.style.left = '280px'
    closeBtn.textContent = 'Закрыть'
    closeBtn.onclick = function () {
        subjects[id].groups = []
        for (let i = 0; i < groups.length; i++) {
            if(groups[i].kurs == parseInt(subjects[id].kursss)) {
                let checked = document.querySelector(`#fgsdjkh${i}`).checked
                if(checked) {
                    subjects[id].groups.push(groups[i].id)
                }
            }
        }
        socket.emit("saveSubjectToJSON", subjects);
        div0.remove()
    }
    div1.appendChild(closeBtn)

    let selectAllBtn = document.createElement('button')
    selectAllBtn.className = 'deletesubject'
    selectAllBtn.style.position = 'relative'
    selectAllBtn.style.top = '435px'
    selectAllBtn.style.left = '70px'
    selectAllBtn.textContent = 'Выбрать все'
    selectAllBtn.onclick = function () {
        for (let i = 0; i < groups.length; i++) if(groups[i].kurs == parseInt(subjects[id].kursss)) document.querySelector(`#fgsdjkh${i}`).checked = true
    }
    div1.appendChild(selectAllBtn)

    let div2 = document.createElement('div')
    div2.className = 'grfsc2'
    div2.style.height = "420px"
    div2.style.overflowY = "scroll"
    div1.appendChild(div2)

    for (let i = 0; i < groups.length; i++) {
        if(groups[i].kurs == parseInt(subjects[id].kursss)) {

            let div3 = document.createElement('div')
            div3.className = 'grfsc3'
            div2.appendChild(div3)

            let checkbox = document.createElement('input')
            checkbox.type = 'checkbox'
            checkbox.name = `fgsdjkh${i}`
            checkbox.id = `fgsdjkh${i}`
            checkbox.checked = isInArray(subjects[id].groups, groups[i].id)
            div3.appendChild(checkbox)
            
            let clabel = document.createElement('label')
            clabel.setAttribute('for', `fgsdjkh${i}`)
            clabel.textContent = groups[i].name
            div3.appendChild(clabel)
        }
    }
}

function addGroupList() {

    let div0 = document.createElement('div')
    div0.className = 'groupList'
    div0.style.display = 'flex'
    div0.style.flexWrap = 'wrap'
    div0.style.boxSizing = 'border-box'
    div0.style.padding = '20px'
    div0.style.justifyContent = 'center'
    document.querySelector('.cont0 > .w1').appendChild(div0)
    
    let title = document.createElement('h1')
    title.textContent = 'Добавление группы'
    title.style.marginTop = '5px'
    div0.appendChild(title)

    let inputGr = document.createElement('input')
    inputGr.type = 'text'
    inputGr.className = 'inputGr'
    inputGr.placeholder = 'Группа'
    inputGr.style.width = '295px'
    inputGr.style.marginRight = '15px'
    div0.appendChild(inputGr)
    
    let selectKurs = document.createElement('select')
    selectKurs.className = 'selectKurs'
    div0.appendChild(selectKurs)

    let ok1 = document.createElement('option')
    ok1.value = '1'
    ok1.text = '1 курс'
    selectKurs.appendChild(ok1)
    let ok2 = document.createElement('option')
    ok2.value = '2'
    ok2.text = '2 курс'
    selectKurs.appendChild(ok2)
    let ok3 = document.createElement('option')
    ok3.value = '3'
    ok3.text = '3 курс'
    selectKurs.appendChild(ok3)
    let ok4 = document.createElement('option')
    ok4.value = '4'
    ok4.text = '4 курс'
    selectKurs.appendChild(ok4)

    let buttonGr = document.createElement('button')
    buttonGr.textContent = 'Добавить'
    buttonGr.className = 'deletesubject'
    buttonGr.onclick = addGroup
    div0.appendChild(buttonGr)

    
    
    let div1 = document.createElement('div')
    div1.className = 'groupList0' 
    div1.style.boxSizing = 'border-box' 
    div1.style.width = '500px' 
    div1.style.minHeight = '100px' 
    div1.style.borderRadius = '5px' 
    div1.style.display = 'flex' 
    div1.style.flexWrap = 'wrap' 
    div1.style.justifyContent = 'center' 
    div0.appendChild(div1)

    let delallbtn = document.createElement('button')
    delallbtn.textContent = 'Удалить все'
    delallbtn.className = 'deletesubject'
    delallbtn.onclick = deleteAllGroups
    div0.appendChild(delallbtn)
}

function addGroup() {
    let vinput = document.querySelector('.cont0 > .w1 > .groupList > .inputGr').value
    let vselect = parseInt(document.querySelector('.cont0 > .w1 > .groupList > .selectKurs').value)
    let id = 0
    for(i = 0; i < groups.length; i++)
    {
        if(id <= groups[i].id) id = groups[i].id+1;
    }
    groups.push({kurs: vselect, name: vinput, id: id})
    socket.emit("saveGroupsToJSON", groups);
    setGroupsList()
}

function deleteAllGroups() {
    groups = []
    socket.emit("saveGroupsToJSON", groups);
    setGroupsList()
}

function setGroupsList() {
    document.querySelector('.cont0 > .w1 > .groupList > .groupList0').innerHTML = ''
    let title0 = document.createElement('h1')
    title0.textContent = 'Список групп'
    document.querySelector('.cont0 > .w1 > .groupList > .groupList0').appendChild(title0)
    for(let i = 0; i < groups.length; i++)
    {
        let div = document.createElement('div')
        div.style.width = '350px'
        div.style.height = '35px'
        div.style.backgroundColor = 'rgba(0, 0, 0, 0.2)'
        div.style.borderRadius = '5px'
        div.style.boxSizing = 'border-box'
        div.style.padding = '10px'
        div.style.marginBottom = '10px'
        div.textContent = `${groups[i].name} (${groups[i].kurs} курс)`
        document.querySelector('.cont0 > .w1 > .groupList > .groupList0').appendChild(div)

        let delbtn = document.createElement('button')
        delbtn.textContent = 'Удалить'
        delbtn.className = 'deletesubject'
        delbtn.style.marginTop = '0px'
        delbtn.style.marginLeft = '5px'
        delbtn.onclick = function () {
            groups.splice(i, 1);
            socket.emit("saveGroupsToJSON", groups);
            setGroupsList()
        }
        document.querySelector('.cont0 > .w1 > .groupList > .groupList0').appendChild(delbtn)
    }
}

function setForbidList() {
    if(document.querySelector(`.container > .cont0 > .addDate > .datelist`))
    {
        let list = ``
        for(let i = 0; i < forbidDates.length; i++) list += `
        <input type="date" name="forbidDate" id="forbidDate${i}" onchange="saveForbidDate(${i})">
        <button class="deleteforbid" onclick="deleteForbidDate(${i})">Удалить</button>`
        document.querySelector(`.container > .cont0 > .addDate > .datelist`).innerHTML = list;
        for(let i = 0; i < forbidDates.length; i++) document.querySelector(`.container > .cont0 > .addDate > .datelist > #forbidDate${i}`).value = forbidDates[i];
    }
}

function deleteForbidDate(id) {
    forbidDates.splice(id, 1);
    socket.emit("saveForbidDatesToJSON", forbidDates);
    setForbidList();
}

function deleteSubject(id) {
    subjects.splice(id, 1);
    socket.emit("saveSubjectToJSON", subjects);
    setSubjList()
}
function deleteSubjectAll() {
    subjects = [];
    socket.emit("saveSubjectToJSON", subjects);
    setSubjList()
}

function isInArray(array, value) {
    for(let i = 0; i < array.length; i++) if(array[i] === value) return true;
    return false;
}

function generateSchedule() {
    let start_time = new Date().getTime()
    let weekDays = [
        'Воскресенье',
        'Понедельник',
        'Вторник',
        'Среда',
        'Четверг',
        'Пятница',
        'Суббота'
    ];
    let monthDays = [
        'Янв',
        'Фев',
        'Мар',
        'Апр',
        'Май',
        'Июн',
        'Июл',
        'Авг',
        'Сен',
        'Окт',
        'Ноя',
        'Дек',
    ]
    getvalidDates()
    document.querySelector('.generatedTable').innerHTML = ''
    let table = document.createElement('table');
    table.style.textAlign = "center"
    table.style.alignContent = 'center'
    table.id = "generatedTable123"
    let рrow = table.insertRow();
    let рcolumn = рrow.insertCell();
    рcolumn.innerHTML = 'Дата'

    let рcolumn1 = рrow.insertCell();
    рcolumn1.innerHTML = 'День'

    let рcolumn2 = рrow.insertCell();
    рcolumn2.innerHTML = 'Пара'

    let selectedKurs = parseInt(document.querySelector('#selkurs').value)
    for(let i = 0; i < groups.length; i++)
    {
        if(groups[i].kurs === selectedKurs)
        {
            let gname = рrow.insertCell();
            gname.innerHTML = groups[i].name
            gname.colSpan = 2
        }
    }

    let parAmount = []
    let parStart = []
    let pargdfslk = []
    let dayPar = [
        [],
        [],
        [],
        [],
        [],
        []
    ]
    for(let i = 0; i < validDays.length; i++)
    {
        let row = table.insertRow();
        let column = row.insertCell();
        let date = new Date(validDays[i])
        let datef = `${date.getDate()}-${monthDays[date.getMonth()]}`
        column.innerHTML = datef
        column.rowSpan = 13
        column.style.transform = "rotate(-90deg)"

        let column1 = row.insertCell();
        column1.innerHTML = weekDays[date.getDay()]
        column1.rowSpan = 13
        column1.style.transform = "rotate(-90deg)"
        for(let i = 0; i < groups.length; i++)
        {
            if(groups[i].kurs === selectedKurs)
            {
                parAmount[i] = randomParAm();
                parStart[i] = random(1, 6.9-parAmount[i]);
            }
        }
        for(let t = 0; t < groups.length; t++) pargdfslk[t] = 0;
        for(let k = 1; k < 7; k++)
        {
            let rowParaName = table.insertRow();
            let rowParaPrep = table.insertRow();
            let column2 = rowParaName.insertCell();
            column2.innerHTML = k
            column2.rowSpan = 2

            for(let t = 0; t < groups.length; t++)
            {
                if(groups[t].kurs === selectedKurs)
                {
                    let key = getRandomSubjectKey(selectedKurs)
                    while (subjects[key].kursss != selectedKurs)
                    {
                        key = getRandomSubjectKey(selectedKurs)
                    }
                    let sss = new Date().getTime()/1000
                    while (isInArray(dayPar[k-1], key))
                    {
                        key = getRandomSubjectKey(selectedKurs)
                        while (subjects[key].kursss != selectedKurs)
                        {
                            key = getRandomSubjectKey(selectedKurs)
                        }

                        let ssn = new Date().getTime()/1000
                        if (ssn-sss > 0.05)
                        {
                            key = -1
                            parAmount[t]++
                            break
                        }
                    }
                    dayPar[k-1][dayPar.length] = key
                    let column3 = rowParaName.insertCell();
                    let column4 = rowParaPrep.insertCell();
                    let column5 = rowParaName.insertCell();
                    column5.rowSpan = 2
                    column3.style.height = "30px"
                    column4.style.height = "30px"
                    column5.style.height = "60px"
                    if (k >= parStart[t])
                    {
                        if(pargdfslk[t] < parAmount[t] && key != -1)
                        {
                            column3.innerHTML = `${subjects[key].subject}`
                            column4.innerHTML = `${subjects[key].teacher}`
                            column5.innerHTML = `${subjects[key].cabinet}`
                            pargdfslk[t]++;
                        }
                    }
                }
            }
        }
    }

    for (let a = 0; a < subjects.length; a++)
    {
        if (subjects[a].kursss === selectedKurs)
        {
            let r = 0;
            groups.forEach(gr => {
                if (gr.kurs == selectedKurs) r++;
            })
            
            console.log(`${subjects[a].subject} max: ${(subjects[a].hours/2)*r}`);
        }
    }

    document.querySelector('.generatedTable').appendChild(table)
    let end_time = new Date().getTime()
    console.log((end_time-start_time)/1000);

    addDownloadBtn()
}

function getRandomSubjectKey() {
    let sum = 0;
    let hours = []
    for (let i = 0; i < subjects.length; i++) {
        hours[i] = subjects[i].hours
        sum += hours[i];
        hours[i]-=2
    }

    let rand = Math.floor(Math.random() * sum);

    let i = 0;
    for (let s = subjects[0].hours; s <= rand; s += subjects[i].hours) {
        i++;
    }
    return i;
}

function randomParAm() {
    let r = random(0, 5)
    let res = 0
    if(r == 3) {
        let t = random(0, 4)
        res =  t == 0 ? 2 : 4
    }
    else res = 3
    return res
}

function tableToExcel(fileName) {
    let table = document.getElementById('generatedTable123');
    return TableToExcel.convert(table, {
        name: fileName,
        sheet: {
            name: 'Sheet 1'
        }
    });
}

function getvalidDates() {
    validDays = []
    let semester = parseInt(document.querySelector('#selectSemester').value);
    if(semester === 2)
    {
        let startdate = new Date(`${new Date().getFullYear()+1}-01-01`);
        let enddate = new Date(`${new Date().getFullYear()+1}-06-30`);
        let date = startdate.getTime();
        let edate = enddate.getTime();
        let days = ((edate-date)/86400/1000)+1;
        for(let i = 0; i < days; i++)
        {
            let day = new Date(date+i*(86400*1000)).getTime()
            
            if(!find_forbidden(day))
            {
                if(new Date(day).getDay() != 0) validDays.push(day);
            }
        }
    }
    else if(semester === 1)
    {
        let startdate = new Date(`${new Date().getFullYear()}-09-01`);
        let enddate = new Date(`${new Date().getFullYear()}-12-31`);
        let date = startdate.getTime();
        let edate = enddate.getTime();
        let days = ((edate-date)/86400/1000)+1;
        
        for(let i = 0; i < days; i++)
        {
            let day = new Date(date+i*(86400*1000)).getTime()
            
            if(!find_forbidden(day))
            {
                if(new Date(day).getDay() != 0) validDays.push(day);
            }
        }
    }
}

function find_forbidden(value)
{
    for(let i = 0; i < forbidDates.length; i++)
    {
        let time = new Date(forbidDates[i]).getTime()
        if(time === value)
        {
            return true
        }
    }
    return false
}

function random(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function addGenerateBtn() {
    if(document.querySelector('.sSemester > .div12345'))
    {
        let button = document.createElement("button")
        button.className = "generateSchedule"
        button.textContent = "Сгенерировать расписание"
        button.onclick = generateSchedule
        document.querySelector('.sSemester > .div12345').appendChild(button)
    }
}

function addDownloadBtn() {
    if(!document.querySelector(`.sSemester > .div12345 > .generateSchedule`))
    {
        let button = document.createElement("button")
        button.className = "generateSchedule"
        button.textContent = "Скачать расписание"
        button.onclick = function() {
            tableToExcel("schedule.xlsx")
        }
        document.querySelector('.sSemester > .div12345').appendChild(button)
    }
}

socket.on("getSubjectDataFromJSON", (data) => {
    subjects = data;
})
socket.on("getForbidDatesData", (data) => {
    forbidDates = data;
})
socket.on("getForbidDatesData", (data) => {
    forbidDates = data;
    setForbidList();
})
socket.on("getGroupsData", (data) => {
    groups = data;
    addGenerateBtn()
})