
window.config = {
    //api_server: '//nodejs-mongo-persistent-test-webapi.193b.starter-ca-central-1.openshiftapps.com'
    api_server: 'http://localhost:8080'
}

// oauth
function login () {
    let cb = encodeURIComponent(location.protocol+'//'+location.host+location.pathname+'login_cb.html')
    window.location = window.config.api_server+'/oauth0?cb='+cb
}
function logout() {
    window.localStorage.removeItem('token')
    window.location.reload()
}
function api_get_global_token(){
    let token = localStorage.getItem('token')
    if(!token){
	login()
    } else {
	return token
    }
}

function new_game(handler){
    let env = {
	origin: new Array(20).fill('cat'),
	typed: [],
	status: 'stop',
	oninput(ev){
	    if(env.status == 'stop'){ return }
	    if(ev.target.value.indexOf(' ') != -1){
		env.typed.push(ev.target.value.trim())
		handler.post_next_word(env)
	    }
	    handler.post_update(env)
	},
	get_score(){
	    let ret = {
		good_items_count: 0
	    }
	    env.typed.map((v,i)=>{
		if(v == env.origin[i]){ ret.good_items_count += 1 }
	    })
	    return ret
	}
    }
    function timeup(){
	env.status = 'stop'
	handler.post_stop(env)
    }
    env.status = 'start'
    setTimeout(timeup, 10000)
    handler.post_init(env)
}
function new_game_handler(els){
    function show_origin(el, origin, typed, input){
	el.innerHTML = ''
	let status = origin.map((v, i)=>{
	    return [v, typed.length>i, v==typed[i]]
	})
	status.map(([t, e, r])=>{
	    let word_el = document.createElement('span')
	    word_el.classList.add('word')
	    word_el.classList.add(e?(r?'word_good':'word_bad'):'word_unknown')
	    word_el.textContent = t
	    return word_el
	}).reduce((acc,v)=>{
	    acc.appendChild(v)
	    return acc
	}, el)
    }
    return {
	post_init(env){
	    show_origin(els.origin, env.origin, env.typed, els.input)
	    els.input.oninput = env.oninput
	    els.input.value = ''
	},
	post_stop(env){
	    els.result.textContent = env.get_score().good_items_count
	    els.start.disabled = undefined
	},
	post_next_word(env){
	    els.input.value = ''
	},
	post_update(env){
	    show_origin(els.origin, env.origin, env.typed, els.input)
	}
    }
}

function main(){
    api_get_global_token()
    let start_el = document.getElementById('start')
    start_el.onclick = ()=>{
	new_game(new_game_handler({
	    origin: document.getElementById('origin'),
	    input: document.getElementById('input'),
	    result: document.getElementById('result'),
	    start: start_el
	}))
	start_el.disabled = true
    }
}
