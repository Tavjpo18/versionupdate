const $messages = document.querySelector('table #sinhvienjs')
let datad = document.querySelector('#data-template').innerHTML
let fileU = null;
let jSONData = []
axios({
    method: 'get',
    url:  'http://54.251.7.128:3000/sinhvien'
})
    .then((result) => {
        console.log(result.data)
        jSONData = result.data
        for (let i = 0; i < result.data.length; i++) {
            const html = Mustache.render(datad, {
                ...result.data[i]
            })
            $messages.insertAdjacentHTML('beforeend', html)
        }
        console.log($messages)
    })


const getFile = (file) => {
    fileU = file.files[0]
}

const addSinhVien = document.getElementById('them').addEventListener('click', (e) => {
    
    e.preventDefault()
    document.getElementById("wait").style.width = "40px";
    document.getElementById("wait").style.height = "40px";
    document.getElementById('wait').src = "/js/waiting.svg"
    
    var bodyFormData = new FormData();
    const ht = document.getElementById('hoten').value
    const ms = document.getElementById('mssv').value
    const em = document.getElementById('email').value
    const cl = document.getElementById('class1').value
    const avatr = fileU
    console.dir(avatr)
    bodyFormData.append('hoten', ht);
    bodyFormData.append('mssv', ms);
    bodyFormData.append('email', em);
    bodyFormData.append('image', avatr);
    bodyFormData.append('lop', cl);
    axios({
        method: 'post',
        url:  'http://54.251.7.128:3000/sinhvien',
        data: bodyFormData,
        headers:
            { 'Content-Type': 'multipart/form-data'}
    })
        .then((result) => {
            console.log(result)
            location.reload("/")
        }).catch(e => {
            console.log(e)
        })
})

const del = (value) => {
    axios({
        method: 'delete',
        url:  'http://54.251.7.128:3000/sinhvien' + value,
    })
        .then((result) => {
            console.log(result.data)
            location.reload()
        }).catch((error) => {
            console.log(error)
        })
}


const edit = (value) => {
    let editUer = null
    for(let i = 0; i< jSONData.length;i++){
        console.log(jSONData[i].mssv)
        if(jSONData[i].mssv === value.toString()){
            editUer = jSONData[i]
        }
    }
    document.getElementById('mssv').value = editUer.mssv
    document.getElementById('hoten').value = editUer.hoten
    document.getElementById('email').value = editUer.email
    document.getElementById('mssv').setAttribute('disabled','disabled')
    document.getElementById("them").style.visibility = "hidden";
    document.getElementById("them").style.display = "none";
    document.getElementById("sua").style.visibility = "visible";   
}


const editSinhVien = document.getElementById('sua').addEventListener('click', (e) => {
    e.preventDefault()
    axios({
        method: 'patch',
        url:  'http://54.251.7.128:3000/sinhvien'+ document.getElementById('mssv').value,
        data: {
            hoten: document.getElementById('hoten').value,
            email: document.getElementById('email').value
        }
    })
        .then((result) => {
            console.log(result.data)
            location.reload()
        })
})



document.getElementById("sua").style.visibility = "hidden";
