var M_WIDTH=800, M_HEIGHT=450;
var app ={stage:{},renderer:{}},fbs, game_res, assets={},objects={},some_process = {}, game_tick=0,audio_context, my_turn=false, room_name = '', LANG = 0, git_src="";

irnd=(min,max)=>{
	min=Math.ceil(min)
	max=Math.floor(max)
	//return Math.floor(rng.next()*(max-min+1))+min
	return Math.floor(Math.random()*(max-min+1))+min
}

const dirs=[[0,-1],[0,1],[-1,0],[1,0]]
const CELL_ON_STAGE_SIZE=40
const IMG_SIZE=800
const img_loader=new PIXI.Loader()

const worlds_data=[
	{conf:[6,6],theme:'food',pics:[0,1,2,3]},
	{conf:[6,6],theme:'movies',pics:[0,1,2,3]},
	{conf:[6,6],theme:'cartoons',pics:[0,1,2,3]},
	{conf:[6,6],theme:'cats',pics:[0,1,2,3]},
	{conf:[6,6],theme:'food',pics:[4,5,6,7]},
	{conf:[7,7],theme:'movies',pics:[4,5,6,7]},
	{conf:[7,7],theme:'cats',pics:[4,5,6,7,8]},
	{conf:[7,7],theme:'cartoons',pics:[4,5,6,7,8]},
	{conf:[7,7],theme:'food',pics:[8,9,10,11]},
	{conf:[7,7],theme:'cartoons',pics:[9,10,11,12,13]},
	{conf:[7,7],theme:'cats',pics:[9,10,11,12,13]},
	{conf:[7,7],theme:'food',pics:[12,13,14,15,16,17,18]},
	{conf:[7,7],theme:'cartoons',pics:[14,15,16,17,18,19]},
	{conf:[8,8],theme:'cartoons',pics:[20,21,22,23,24]},

]
let all_completed=0

const figures=[
	[[0,0],[1,0],[0,1],[1,1],],
	[[0,0],[0,1],],
	[[0,0],[1,0],],
	[[0,0],[0,1],[0,2],],
	[[0,0],[1,0],[2,0],],
	[[0,0],[1,0],[0,1],],
	[[0,0],[0,1],[1,1],],
	[[1,0],[0,1],[1,1],],
	[[0,0],[1,0],[1,1],],
	[[0,0],[0,1],[0,2],[1,2],],
	[[2,0],[0,1],[1,1],[2,1],],
	[[0,0],[1,0],[1,1],[1,2],],
	[[0,0],[1,0],[2,0],[0,1],],
	[[1,0],[1,1],[0,2],[1,2],],
	[[0,0],[0,1],[1,1],[2,1],],
	[[0,0],[1,0],[0,1],[0,2],],
	[[0,0],[1,0],[2,0],[2,1],],
	[[0,0],[1,0],[2,0],[1,1],],
	[[0,0],[0,1],[1,1],[0,2],],
	[[1,0],[0,1],[1,1],[2,1],],
	[[1,0],[0,1],[1,1],[1,2],],
	[[0,0],[0,1],[1,1],[1,2],],
	[[0,0],[1,0],[1,1],[2,1],],
	[[1,0],[0,1],[1,1],[0,2],],
	[[1,0],[2,0],[0,1],[1,1],],
	[[0,0],[1,0],[0,1],[0,2],[1,2],],
	[[0,0],[1,0],[2,0],[0,1],[2,1],],
	[[0,0],[1,0],[1,1],[0,2],[1,2],],
	[[0,0],[2,0],[0,1],[1,1],[2,1],],
	[[0,0],[1,0],[0,1],[1,1],[0,2],],
	[[0,0],[1,0],[0,1],[1,1],[2,1],],
	[[1,0],[0,1],[1,1],[0,2],[1,2],],
	[[0,0],[1,0],[2,0],[1,1],[2,1],],
	[[0,0],[1,0],[0,1],[1,1],[1,2],],
	[[1,0],[2,0],[0,1],[1,1],[2,1],],
	[[0,0],[0,1],[1,1],[0,2],[1,2],],
	[[0,0],[1,0],[2,0],[0,1],[1,1],]
]

class SeededRandom {
  constructor(seed = Date.now()) {
    this.seed = seed % 2147483647;
    if (this.seed <= 0) this.seed += 2147483646;
  }

  // Generate random number between 0 and 1
  next() {
    this.seed = (this.seed * 16807) % 2147483647;
    return (this.seed - 1) / 2147483646;
  }

  // Generate random number in range [min, max]
  nextBetween(min, max) {
    return min + (max - min) * this.next();
  }

  // Generate random integer in range [min, max]
  nextInt(min, max) {
    return Math.floor(min + (max - min + 1) * this.next());
  }
}

class world_icon_class extends PIXI.Container{
	
	constructor(x,y){
		
		super()
		
		this.hash=irnd(1,999999)
		this.world_ind=0
		this.comp=0
		this.res_assigned=''
		
		this.bcg=new PIXI.Sprite(assets.wcard_bcg)
		this.bcg.width=200
		this.bcg.height=250
		
		this.pic_preview=new PIXI.Graphics()
		this.pic_preview.x=20
		this.pic_preview.y=20	
		
		this.progress_bar_mask=new PIXI.Graphics()
		this.progress_bar_mask.x=30
		this.progress_bar_mask.y=200
		this.progress_bar_mask.beginFill(0xff0000)
		this.progress_bar_mask.drawRect(0,0,140,30)
		this.progress_bar_mask.width=0.1
		
		this.progress_bar=new PIXI.Sprite(assets.wcard_progress_bar)
		this.progress_bar.width=160
		this.progress_bar.height=50
		this.progress_bar.x=20
		this.progress_bar.y=190
		this.progress_bar.mask=this.progress_bar_mask
		
		this.progress_t=new PIXI.BitmapText('0 / 0', {fontName: 'mfont',fontSize: 25,align: 'center'});
		this.progress_t.tint=0x111100;
		this.progress_t.x=100;
		this.progress_t.y=215;
		this.progress_t.anchor.set(0.5,0.5)
		
		this.level_t=new PIXI.BitmapText('Уровень 1', {fontName: 'mfont',fontSize: 30,align: 'center'});
		this.level_t.tint=0xffffff;
		this.level_t.x=100;
		this.level_t.y=0;
		this.level_t.anchor.set(0.5,0.5)
		
		this.theme_t=new PIXI.BitmapText('', {fontName: 'mfont',fontSize: 25,align: 'center'});
		this.theme_t.tint=0xffffff;
		this.theme_t.x=85;
		this.theme_t.y=40;
		this.theme_t.anchor.set(0.5,0.5)
		
		this.size_t=new PIXI.BitmapText('', {fontName: 'mfont',fontSize: 28,align: 'center'});
		this.size_t.tint=0xffffff;
		this.size_t.x=66;
		this.size_t.y=159;
		this.size_t.anchor.set(0.5,0.5)
		
		this.conf_t=new PIXI.BitmapText('', {fontName: 'mfont',fontSize: 28,align: 'center'});
		this.conf_t.tint=0xffffff;
		this.conf_t.x=145;
		this.conf_t.y=159;
		this.conf_t.anchor.set(0.5,0.5)
		
		this.front=new PIXI.Sprite(assets.wcard_front)
		this.front.width=200
		this.front.height=200
		
		this.lock_icon=new PIXI.Sprite(assets.wcard_lock_img)
		this.lock_icon.width=140
		this.lock_icon.height=140
		this.lock_icon.x=100
		this.lock_icon.y=105
		this.lock_icon.anchor.set(0.5,0.5)
		this.lock_icon.visible=false
		
		this.pivot.x=100
		this.pivot.y=125

		this.x=x
		this.y=y
		
		this.addChild(this.bcg,this.pic_preview,this.front,this.progress_bar,this.progress_bar_mask,this.progress_t,this.level_t,this.theme_t,this.size_t,this.conf_t,this.lock_icon)
		
	}
	
	set_bcg(res_name){
				
		this.res_assigned=res_name
		const texture=img_loader.resources[res_name].texture
				
		const textureWidth = texture.baseTexture.width;
		const textureHeight = texture.baseTexture.height;

		// Calculate the scale to fit the texture to the circle's size
		const scaleX = 160 / textureWidth;
		const scaleY = 160 / textureHeight;

		// Create a new matrix for the texture
		const matrix = new PIXI.Matrix();

		// Scale and translate the matrix to fit the circle
		matrix.scale(scaleX, scaleY);
		
		this.pic_preview.clear()
		this.pic_preview.beginTextureFill({texture,matrix})
		this.pic_preview.drawRoundedRect(0,0,160,160,20)
		this.pic_preview.endFill()
		
	}
	
	set_world(w_ind){
				
		if (w_ind<0||w_ind>=worlds_data.length){
			this.visible=false			
			return
		}
		
		this.visible=true
		this.hash=irnd(1,999999)
		this.world_ind=w_ind
		this.comp=main_menu.get_world_comp(w_ind)
		
		if (this.comp<0){
			this.lock_icon.visible=true
			this.comp=0
		}else
			this.lock_icon.visible=false
		
		//отображаем уровень
		const human_level=w_ind+1
		this.level_t.text='Уровень '+human_level			

		//заполняем данные
		this.theme_t.text=worlds_data[w_ind].theme
		this.size_t.text=worlds_data[w_ind].pics.length
		const conf=worlds_data[w_ind].conf
		this.conf_t.text=conf[0]+'x'+conf[1]
		
		//заполняем прогресс бар
		const w_size=worlds_data[w_ind].pics.length
		this.progress_t.text=this.comp+' / '+w_size
		this.progress_bar_mask.width=140*this.comp/w_size
		
	}
	
	async add_progress(){
		
		const w_size=worlds_data[this.world_ind].pics.length
		const comp=Math.max(0,main_menu.get_world_comp(this.world_ind))
		const tar_comp=comp+1
		const cur_w=140*comp/w_size
		const tar_w=140*tar_comp/w_size
		await anim3.add(this.progress_bar_mask,{width:[cur_w,tar_w,'linear']}, true, 2)
		this.progress_t.text=tar_comp+' / '+w_size
		
		return tar_comp===w_size
	}
	
	
}

anim3={

	c1: 1.70158,
	c2: 1.70158 * 1.525,
	c3: 1.70158 + 1,
	c4: (2 * Math.PI) / 3,
	c5: (2 * Math.PI) / 4.5,
	empty_spr : {x:0,visible:false,ready:true, alpha:0},

	slots: new Array(50).fill().map(u => ({obj:{},on:0,block:true,params_num:0,p_resolve:0,progress:0,vis_on_end:false,tm:0,params:new Array(10).fill().map(u => ({param:'x',s:0,f:0,d:0,func:this.linear}))})),

	any_on() {

		for (let s of this.slots)
			if (s.on&&s.block)
				return true
		return false;
	},

	wait(seconds){
		return this.add(this.empty_spr,{x:[0,1,'linear']}, false, seconds);
	},

	linear(x) {
		return x
	},

	kill_anim(obj) {

		for (var i=0;i<this.slots.length;i++){
			const slot=this.slots[i];
			if (slot.on&&slot.obj===obj){
				slot.p_resolve(2);
				slot.on=0;
			}
		}
	},

	easeBridge(x){

		if(x<0.1)
			return x*10;
		if(x>0.9)
			return (1-x)*10;
		return 1
	},

	easeOutBack(x) {
		return 1 + this.c3 * Math.pow(x - 1, 3) + this.c1 * Math.pow(x - 1, 2);
	},

	easeOutElastic(x) {
		return x === 0
			? 0
			: x === 1
			? 1
			: Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * this.c4) + 1;
	},

	easeOutSine(x) {
		return Math.sin( x * Math.PI * 0.5);
	},

	easeOutQuart(x){
		return 1 - Math.pow(1 - x, 4);
	},

	easeOutCubic(x) {
		return 1 - Math.pow(1 - x, 3);
	},

	flick(x){

		return Math.abs(Math.sin(x*6.5*3.141593));

	},

	easeInBack(x) {
		return this.c3 * x * x * x - this.c1 * x * x;
	},

	easeInQuad(x) {
		return x * x;
	},

	easeOutBounce(x) {
		const n1 = 7.5625;
		const d1 = 2.75;

		if (x < 1 / d1) {
			return n1 * x * x;
		} else if (x < 2 / d1) {
			return n1 * (x -= 1.5 / d1) * x + 0.75;
		} else if (x < 2.5 / d1) {
			return n1 * (x -= 2.25 / d1) * x + 0.9375;
		} else {
			return n1 * (x -= 2.625 / d1) * x + 0.984375;
		}
	},

	easeInCubic(x) {
		return x * x * x;
	},

	ease3peaks(x){

		if (x < 0.16666) {
			return x / 0.16666;
		} else if (x < 0.33326) {
			return 1-(x - 0.16666) / 0.16666;
		} else if (x < 0.49986) {
			return (x - 0.3326) / 0.16666;
		} else if (x < 0.66646) {
			return 1-(x - 0.49986) / 0.16666;
		} else if (x < 0.83306) {
			return (x - 0.6649) / 0.16666;
		} else if (x >= 0.83306) {
			return 1-(x - 0.83306) / 0.16666;
		}
	},

	ease2back(x) {
		return Math.sin(x*Math.PI);
	},

	easeInOutCubic(x) {

		return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
	},

	easeInOutBack(x) {

		return x < 0.5
		  ? (Math.pow(2 * x, 2) * ((this.c2 + 1) * 2 * x - this.c2)) / 2
		  : (Math.pow(2 * x - 2, 2) * ((this.c2 + 1) * (x * 2 - 2) + this.c2) + 2) / 2;
	},

	shake(x) {

		return Math.sin(x*2 * Math.PI);


	},

	add (obj, inp_params, vis_on_end, time, block) {

		//если уже идет анимация данного спрайта то отменяем ее
		anim3.kill_anim(obj);


		let found=false;
		//ищем свободный слот для анимации
		for (let i = 0; i < this.slots.length; i++) {

			const slot=this.slots[i];
			if (slot.on) continue;

			found=true;

			obj.visible = true
			obj.ready = false

			//заносим базовые параметры слота
			slot.on=1;
			slot.params_num=Object.keys(inp_params).length;
			slot.obj=obj;
			slot.vis_on_end=vis_on_end;
			slot.block=block===undefined;
			slot.speed=0.01818 / time;
			slot.progress=0;

			//добавляем дельту к параметрам и устанавливаем начальное положение
			let ind=0;
			for (const param in inp_params) {

				const s=inp_params[param][0];
				let f=inp_params[param][1];
				const d=f-s;


				//для возвратных функцие конечное значение равно начальному что в конце правильные значения присвоить
				const func_name=inp_params[param][2];
				const func=anim3[func_name].bind(anim3);
				if (func_name === 'ease2back'||func_name==='shake') f=s;

				slot.params[ind].param=param;
				slot.params[ind].s=s;
				slot.params[ind].f=f;
				slot.params[ind].d=d;
				slot.params[ind].func=func;
				ind++;

				//фиксируем начальное значение параметра
				obj[param]=s;
			}

			return new Promise(resolve=>{
				slot.p_resolve = resolve;
			});
		}

		console.log("Кончились слоты анимации");

		//сразу записываем конечные параметры анимации
		for (let param in params)
			obj[param]=params[param][1];
		obj.visible=vis_on_end;
		obj.alpha = 1;
		obj.ready=true;


	},

	process () {

		for (var i = 0; i < this.slots.length; i++) {
			const slot=this.slots[i];
			const obj=slot.obj;
			if (slot.on) {

				slot.progress+=slot.speed;

				for (let i=0;i<slot.params_num;i++){

					const param_data=slot.params[i];
					const param=param_data.param;
					const s=param_data.s;
					const d=param_data.d;
					const func=param_data.func;
					slot.obj[param]=s+d*func(slot.progress);
				}

				//если анимация завершилась то удаляем слот
				if (slot.progress>=0.999) {

					//заносим конечные параметры
					for (let i=0;i<slot.params_num;i++){
						const param=slot.params[i].param;
						const f=slot.params[i].f;
						slot.obj[param]=f;
					}

					slot.obj.visible=slot.vis_on_end;
					if(!slot.vis_on_end) slot.obj.alpha=1;

					slot.obj.ready=true
					slot.p_resolve(1)
					slot.on = 0
				}
			}
		}
	}
}

sound = {
	
	on : 1,
	
	play(snd_res) {
		
		if (this.on === 0)
			return;
		
		if (!assets[snd_res])
			return;
		
		assets[snd_res].play();	
		
	},
	
	switch(){
		
		if (this.on){
			this.on=0;
			objects.pref_info.text=['Звуки отключены','Sounds is off'][LANG];
			
		} else{
			this.on=1;
			objects.pref_info.text=['Звуки включены','Sounds is on'][LANG];
		}
		anim2.add(objects.pref_info,{alpha:[0,1]}, false, 3,'easeBridge',false);		
		
	}
	
}

// Usage
//let rng = new SeededRandom(2);

resize=function() {
    const vpw = window.innerWidth;  // Width of the viewport
    const vph = window.innerHeight; // Height of the viewport
    let nvw; // New game width
    let nvh; // New game height

    if (vph / vpw < M_HEIGHT / M_WIDTH) {
      nvh = vph;
      nvw = (nvh * M_WIDTH) / M_HEIGHT;
    } else {
      nvw = vpw;
      nvh = (nvw * M_HEIGHT) / M_WIDTH;
    }
    app.renderer.resize(nvw, nvh);
    app.stage.scale.set(nvw / M_WIDTH, nvh / M_HEIGHT);
}

main_loader={

	preload_assets:0,

	spritesheet_to_tex(t,xframes,yframes,total_w,total_h,xoffset,yoffset){


		const frame_width=xframes?total_w/xframes:0;
		const frame_height=yframes?total_h/yframes:0;

		const textures=[];
		for (let y=0;y<yframes;y++){
			for (let x=0;x<xframes;x++){

				const rect = new PIXI.Rectangle(xoffset+x*frame_width, yoffset+y*frame_height, frame_width, frame_height);
				const quadTexture = new PIXI.Texture(t.baseTexture, rect);
				textures.push(quadTexture);
			}
		}
		return textures;
	},

	async load1(){

		git_src=''

		const loader=new PIXI.Loader();

		loader.add('load_list',git_src+'load_list.txt');
		await new Promise(res=>loader.load(res))


		//добавляем из запускного листа загрузки
		const load_list=eval(loader.resources.load_list.data)
		for (let i = 0; i < load_list.length; i++)
			if (load_list[i].class==='sprite' || load_list[i].class==='image')
				loader.add(load_list[i].name, git_src+'res/RUS/' + load_list[i].name + '.' +  load_list[i].image_format);


		loader.add('mfont',git_src+'fonts/core_sans_ds/font.fnt');
		loader.add('mfont2',git_src+'fonts/core_sans_ds_shadow/font.fnt');
		loader.add('snap1','snap1.mp3');
		loader.add('snap2','snap2.mp3');
		loader.add('puzzle_complete','puzzle_complete.mp3');
		loader.add('tile_bcg','res/tile_bcg.jpg');


		//загружаем
		await new Promise(res=>loader.load(res))

		//переносим все в ассеты
		for (const res_name in loader.resources){
			const res=loader.resources[res_name];
			assets[res_name]=res.texture||res.sound||res.data;
		}

		//создаем спрайты и массивы спрайтов и запускаем первую часть кода
		for (var i = 0; i < load_list.length; i++) {
			const obj_class = load_list[i].class;
			const obj_name = load_list[i].name;
			console.log('Processing: ' + obj_name)

			switch (obj_class) {
			case "sprite":
				objects[obj_name] = new PIXI.Sprite(assets[obj_name]);
				eval(load_list[i].code0);
				break;

			case "block":
				if (obj_name==='cells')
					console.log(load_list[i].code)
				eval(load_list[i].code0);
				break;

			case "cont":
				eval(load_list[i].code0);
				break;

			case "array":
				var a_size=load_list[i].size;
				objects[obj_name]=[];
				for (var n=0;n<a_size;n++)
					eval(load_list[i].code0);
				break;
			}
		}

		//обрабатываем вторую часть кода в объектах
		for (var i = 0; i < load_list.length; i++) {
			const obj_class = load_list[i].class;
			const obj_name = load_list[i].name;
			console.log('Processing: ' + obj_name)


			switch (obj_class) {
			case "sprite":
				eval(load_list[i].code1);
				break;

			case "block":
				eval(load_list[i].code1);
				break;

			case "cont":
				eval(load_list[i].code1);
				break;

			case "array":
				var a_size=load_list[i].size;
					for (var n=0;n<a_size;n++)
						eval(load_list[i].code1);	;
				break;
			}
		}



	},

	async load2(){

		//подпапка с ресурсами
		const lang_pack = ['RUS','ENG'][LANG];

		const bundle=[];

		const loader=new PIXI.Loader();

		loader.add('init_load_list',git_src+'load_list.txt');
		await new Promise(res=>loader.load(res))

		//добавляем из запускного листа загрузки
		load_list=eval(loader.resources.init_load_list.data)

		//добавляем из основного листа загрузки
		for (let i = 0; i < load_list.length; i++)
			if (load_list[i].class==='sprite' || load_list[i].class==='image')
				loader.add(load_list[i].name, git_src+'res/'+lang_pack + '/' + load_list[i].name + "." +  load_list[i].image_format);

		//ждем загрузки
		await new Promise(res=>loader.load(res))


		//создаем спрайты и массивы спрайтов и запускаем первую часть кода
		const main_load_list=eval(assets.main_load_list);
		for (var i = 0; i < main_load_list.length; i++) {
			const obj_class = main_load_list[i].class;
			const obj_name = main_load_list[i].name;
			console.log('Processing: ' + obj_name)

			switch (obj_class) {
			case "sprite":
				objects[obj_name] = new PIXI.Sprite(assets[obj_name]);
				eval(main_load_list[i].code0);
				break;

			case "block":
				if (obj_name==='cells')
					console.log(main_load_list[i].code)
				eval(main_load_list[i].code0);
				break;

			case "cont":
				eval(main_load_list[i].code0);
				break;

			case "array":
				var a_size=main_load_list[i].size;
				objects[obj_name]=[];
				for (var n=0;n<a_size;n++)
					eval(main_load_list[i].code0);
				break;
			}
		}

		//обрабатываем вторую часть кода в объектах
		for (var i = 0; i < main_load_list.length; i++) {
			const obj_class = main_load_list[i].class;
			const obj_name = main_load_list[i].name;
			console.log('Processing: ' + obj_name)


			switch (obj_class) {
			case "sprite":
				eval(main_load_list[i].code1);
				break;

			case "block":
				eval(main_load_list[i].code1);
				break;

			case "cont":
				eval(main_load_list[i].code1);
				break;

			case "array":
				var a_size=main_load_list[i].size;
					for (var n=0;n<a_size;n++)
						eval(main_load_list[i].code1);	;
				break;
			}
		}


	}

}

class puzzle_block_class extends PIXI.Container{

	constructor(w,h){

		super()
		this.gy=0
		this.gx=0

		this.id=0
		this.index=0

		this.composition_ind=-1

		this.m_cells=[]
		for (let i=0;i<5;i++){			
			const s=new PIXI.Sprite()
			s.visible=false
			s.interactive=true
			s.pointerdown=block_down.bind(this)
			s.pointerup=block_up.bind(this)
			this.m_cells.push(s)
		}

		this.overlay=new PIXI.Graphics()
		//this.overlay.visible=false

		this.frame=new PIXI.Graphics()
		this.frame.width=1
		this.frame.height=1
		this.frame.x=0
		this.frame.y=0

		this.visible=false

		this.addChild(...this.m_cells,this.overlay,this.frame)
	}

}

soft_placer={

	area:[],
	area_w:0,
	area_h:0,

	run(w,h){
		
		
		const hor_cells_fit=Math.floor(M_WIDTH/CELL_ON_STAGE_SIZE)
		const ver_cells_fit=Math.floor(M_HEIGHT/CELL_ON_STAGE_SIZE)

		const vis_blocks=objects.puzzle_blocks.filter(b=>b.visible===true)

		for (let v=0;v<3000;v++){

			this.area=Array(ver_cells_fit).fill('').map(() => Array(hor_cells_fit).fill(''))
			this.area.w=hor_cells_fit
			this.area.h=ver_cells_fit

			let blocks_added=0
			for (let i=0;i<500;i++){

				const sy=irnd(2,ver_cells_fit-2)
				const sx=irnd(1,hor_cells_fit-2)
				const block=vis_blocks[blocks_added]

				const valid=this.check_block(sy,sx,block,this.area)

				if (valid){
					this.add_block_to_area(sy,sx,block,this.area)
					block.gy=sy
					block.gx=sx
					blocks_added++
				}

				if (blocks_added===vis_blocks.length){
					console.log('SOFT PLACER all_completed, step:',v)
					return this.area
				}


			}

		}

		return 0

	},

	check_block(sy,sx,block, area){

		const all_dirs=[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]

		//пытаемся разместить фигуру
		const pnts=figures[block.id]
		for (let pnt of pnts){

			const ty=sy+pnt[0]
			const tx=sx+pnt[1]

			if (ty>area.h-1||tx>area.w-1) return 0

			const tar_point=area[ty][tx]
			if (tar_point!=='') return 0

			//проверяем соседей
			for (const dir of dirs){

				const my=sy+pnt[0]+dir[0]
				const mx=sx+pnt[1]+dir[1]

				//проверяем можно ли обращаться к area
				if (my>=0&&mx>=0&&my<area.h&&mx<area.w){

					if (area[my][mx]!=='')
						return 0
				}
			}
		}

		return 1

	},

	add_block_to_area(sy,sx,block,area){

		//размещаем фигуру
		const pnts=figures[block.id]
		for (let pnt of pnts){

			const ty=sy+pnt[0]
			const tx=sx+pnt[1]

			area[ty][tx]=block.ind

		}

	}


}

puzzle={

	z:0,
	fig_ind_area:[],
	cell_ind_area:[],
	blocks_num:0,
	w:0,
	h:0,
	touches:0,
	seconds:0,
	img_texture:0,
	
	async activate(world_ind){
		
		let comp=Math.max(main_menu.get_world_comp(world_ind),0)
		if (comp>=worlds_data[world_ind].pics.length) comp=worlds_data[world_ind].pics.length-1
		const pic_ind=worlds_data[world_ind].pics[comp]
		const theme=worlds_data[world_ind].theme
		const conf=worlds_data[world_ind].conf
		
		await this.load_img(`${theme}_${pic_ind}`,`images/${theme}/${pic_ind}.jpg`)
		this.draw(conf)
		
		this.inc_touches(0)
		
		this.seconds=0
		objects.t_time.text='00:00'
		this.sec_timer=setInterval(()=>{this.sec_tick()},1000)
		
		//objects.bcg.visible=true
		//objects.snap_bcg.visible=true
		objects.header_cont.visible=true

	},
	
	form_sec(seconds) {

		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		const remainingSeconds = Math.floor(seconds % 60);

		// Format with leading zeros
		const formattedMinutes = minutes.toString().padStart(2, '0');
		const formattedSeconds = remainingSeconds.toString().padStart(2, '0');


		if (hours === 0) {
			return `${formattedMinutes}:${formattedSeconds}`;
		} else {
			const formattedHours = hours.toString().padStart(2, '0');
			return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
		}
	},
	
	sec_tick(){
		
		objects.t_time.text=this.form_sec(this.seconds)
		this.seconds++
	},
	
	inc_touches(touches){
		
		//установка
		if (touches>=0){
			this.touches=touches
			objects.t_touches.text=this.touches
			return
		}
		
		this.touches++
		objects.t_touches.text=this.touches
		
	},
	
	async load_img(name,path){
		
		if (img_loader.resources[name]) {
			this.img_texture=img_loader.resources[name].texture
			return
		}
		
		img_loader.add(name,path);
		await new Promise(res=>img_loader.load(res))
		
		this.img_texture=img_loader.resources[name].texture
		
	},

	get_size(figure_id){

		let w=0
		let h=0

		//определяем размеры фигурки
		const figure=figures[figure_id]
		for (let pnt of figure){
			w=Math.max(pnt[1]+1,w)
			h=Math.max(pnt[0]+1,h)
		}

		return [w,h]

	},

	check_figure_is_valid(figure_data){

		let i=0
		for (let i=0;i<figures.length;i++){

			const tar_figure_data=figures[i]

			if (tar_figure_data.length!==figure_data.data.length)
				continue

			const sorted1 = [...tar_figure_data].sort((a, b) => a[1] - b[1] || a[0] - b[0])
			const sorted2 = [...figure_data.data].sort((a, b) => a[1] - b[1] || a[0] - b[0])

			if (JSON.stringify(sorted1) !== JSON.stringify(sorted2))
				continue

			return i

		}

		return 999
	},

	try_append_zero(area,figures_data,zero_nb_id,z_pnt){


		//проверяем можно ли добавить данную клетку к nb_id
		const figure_data=JSON.parse(JSON.stringify(figures_data[zero_nb_id]))
		figure_data.data.push([z_pnt[0],z_pnt[1]])

		//проверяем новую фигуру на валидность
		let minx=999
		let miny=999
		for (let pnt of figure_data.data){
			miny=Math.min(miny,pnt[0])
			minx=Math.min(minx,pnt[1])
		}

		//обновляем данные фигуры (нормализация к началу)
		for (let pnt of figure_data.data){
			pnt[0]-=miny
			pnt[1]-=minx
		}

		//ищем есть ли такая фигура в базе
		const valid_figure_id=this.check_figure_is_valid(figure_data)
		if (valid_figure_id!==999){
			figures_data[zero_nb_id].data.push(z_pnt)
			figures_data[zero_nb_id].id=valid_figure_id

			//новые координаты начала
			figures_data[zero_nb_id].y=miny
			figures_data[zero_nb_id].x=minx

			area[z_pnt[0]][z_pnt[1]]=zero_nb_id
			return 1
		}

		return 0


	},

	try_fill_zero(area,figures_data,z_pnt){

		//соседи к которым можно привязать пустую клетку
		const zero_nb_ids=[]

		for (let dir of dirs){

			const ty=z_pnt[0]+dir[0]
			const tx=z_pnt[1]+dir[1]
			if (ty>=0&&ty<area.h&&tx>=0&&tx<area.w){
				const nb_id=area[ty][tx]
				if(!zero_nb_ids.includes(nb_id) && nb_id>0)
					zero_nb_ids.push(nb_id)
			}
		}

		for (let zero_nb_id of zero_nb_ids){
			const res=this.try_append_zero(area,figures_data,zero_nb_id,z_pnt)
			if(res) return
		}
	},

	try_fill_zeros(area, figures_data){

		//делаем список пустот
		let zeros=[]
		for (let y=0;y<area.h;y++){
			for (let x=0;x<area.w;x++){

				cur_point=area[y][x]
				if (cur_point===0)
					zeros.push([y,x])
			}
		}

		for (let z_pnt of zeros){
			this.try_fill_zero(area,figures_data,z_pnt)
		}

	},

	check_figure(sy,sx,figure, area,i){

		//пытаемся разместить фигуру
		for (let point of figure){

			const ty=sy+point[0]
			const tx=sx+point[1]

			if (ty>area.h-1||tx>area.w-1) return 0

			const tar_point=area[ty][tx]
			if (tar_point) return 0

		}

		return 1

	},

	add_figure_to_area(sy,sx,figure,area,i,figures_data,figure_id){

		//размещаем фигуру
		figures_data[i]={data:[],id:figure_id}
		const figure_data=figures_data[i]

		figure_data.y=sy
		figure_data.x=sx

		for (let point of figure){
			const ty=sy+point[0]
			const tx=sx+point[1]
			figure_data.data.push([ty,tx])

			area[ty][tx]=i
		}

	},

	place_block_to_grid(block){

		//это может быть снап форма
		if (block.ind===undefined){
			block.y = block.gy * CELL_ON_STAGE_SIZE
			block.x = block.gx * CELL_ON_STAGE_SIZE		
		}else{
			const cy=block.y
			const cx=block.x
			const ty=block.gy * CELL_ON_STAGE_SIZE
			const tx=block.gx * CELL_ON_STAGE_SIZE
			anim3.add(block,{x:[cx,tx,'linear'],y:[cy,ty,'linear']}, true, 0.1)
			objects.puzzle_shadows[block.ind].y=ty+5
			objects.puzzle_shadows[block.ind].x=tx+5		
		}

	},

	count_zeroes(area){

		let num=0
		for (let y=0;y<area.h;y++){
			for (let x=0;x<area.w;x++){

				cur_point=area[y][x]
				if (cur_point===0)
					num++
			}
		}

		return num

	},

	get_comp_size(comp){

		let miny=9999
		let minx=9999
		let maxx=-9999
		let maxy=-9999

		//делаем узлы
		for (let ind of comp){

			const block=objects.puzzle_blocks[ind]


			for (let pnt of figures[block.id]){

				const y=block.y
				const x=block.x

				if (y<miny) miny=y
				if (x<minx) minx=x

				const y2=block.y+block.bcg.height
				const x2=block.x+block.bcg.width

				if (y2>maxy) maxy=y2
				if (x2>maxx) maxx=x2

			}
		}


		return [
			minx,
			maxx,
			miny,
			maxy
		]

	},

	get_true_pos(){

		let minx=9999
		let miny=9999

		for (let i=0;i<objects.puzzle_blocks.length;i++){

			const block=objects.puzzle_blocks[i]
			if (!block.visible) continue

			minx=Math.min(minx,block.x)
			miny=Math.min(miny,block.y)
		}

		return [miny,minx]

	},

	get_puzzle_data(w,h){

		//rng = new SeededRandom(s);

		for (let m=1;m<1000;m++){

			const area = Array(h).fill(0).map(() => Array(w).fill(0))
			area.w=w
			area.h=h

			let ok=0
			let sy=0
			let sx=0
			let figure_to_place=0
			let figure_id=0
			let f_num=1

			let figures_data=[]
			let zeroes_num=999

			//пытаемся разместить случайную фигуру
			for (k=0;k<3000;k++){
				figure_id=irnd(0,figures.length-1)
				figure_to_place=figures[figure_id]
				sy=irnd(0,h-1)
				sx=irnd(0,w-1)

				//проверяем фигуру
				const check=this.check_figure(sy,sx,figure_to_place,area,f_num)

				//если подошло то размещаем фигуру на поле
				if (check) {
					this.add_figure_to_area(sy,sx,figure_to_place,area,f_num,figures_data,figure_id)
					f_num++
					//считаем нули
					zeroes_num=this.count_zeroes(area)

					if(zeroes_num<5){

						this.try_fill_zeros(area,figures_data)
						const post_zeros_num=this.count_zeroes(area)
						if (post_zeros_num===0){
							console.log(area)
							return figures_data
						}
						break
					}
				}
			}
		}
		alert('Не получилось разместить фигуры!')

	},

	exit_down(){
	
		this.close();
		main_menu.activate(0)
		
	},

	async close_puzzle(){

		clearInterval(this.sec_timer)
		
		const [y,x]=this.get_true_pos()

		const dy=y-objects.puzzle_cont.y
		const dx=x-objects.puzzle_cont.x

		objects.puzzle_cont.pivot.y=this.h*CELL_ON_STAGE_SIZE*0.5+y
		objects.puzzle_cont.pivot.x=this.w*CELL_ON_STAGE_SIZE*0.5+x

		objects.puzzle_cont.y=objects.puzzle_cont.sy+this.h*CELL_ON_STAGE_SIZE*0.5+y
		objects.puzzle_cont.x=objects.puzzle_cont.sx+this.w*CELL_ON_STAGE_SIZE*0.5+x

		const sy=objects.puzzle_cont.y
		const sx=objects.puzzle_cont.x

		sound.play('puzzle_complete')
		
		await anim3.add(objects.puzzle_cont,{scale_xy:[1,1.5,'linear'],x:[sx,400,'linear'],y:[sy,225,'linear'],angle:[0,10,'linear']}, true, 3)
		await anim3.add(objects.puzzle_cont,{scale_xy:[1.5,1.4,'linear'],alpha:[1,0,'linear']}, true, 2)
		
		this.close()
		main_menu.activate(1)

	},

	async draw(conf){

		//размер поля в ячейках
		const [w_total,h_total]=conf
		this.w=w_total
		this.h=h_total

		//восстанавливаем положение паззла
		objects.puzzle_cont.visible=true
		objects.puzzle_cont.pivot.y=0
		objects.puzzle_cont.pivot.x=0
		objects.puzzle_cont.alpha=1
		objects.puzzle_cont.angle=0
		objects.puzzle_cont.y=objects.puzzle_cont.sy
		objects.puzzle_cont.x=objects.puzzle_cont.sx
		objects.puzzle_cont.scale_xy=1
		objects.puzzle_blocks.forEach(b=>{
			b.visible=false
			b.overlay.visible=false
			b.composition_ind=-1
			b.m_cells.forEach(m=>m.visible=false)
		})
		objects.puzzle_shadows.forEach(b=>{
			b.visible=false
		})

		compositions=[]

		const CELL_ON_IMAGE_SIZE=Math.floor(IMG_SIZE/w_total)

		let i=0

		const puzzle_data=this.get_puzzle_data(w_total,h_total)
		console.log(puzzle_data)

		//информация о целевом поле
		this.area_data=[]
		for (let y=0;y<h_total;y++){
			this.area_data.push([])
			for (let x=0;x<w_total;x++)
				this.area_data[y].push({fig_ind:0,cell_ind:0})
		}

		//вырезаем участки искомого изображения
		for (const block_data of puzzle_data){

			if(!block_data) continue

			const id=block_data.id
			const figure=figures[id]
			const sy=block_data.y
			const sx=block_data.x
			const block=objects.puzzle_blocks[i]
			const m_cells=block.m_cells
			const shadow=objects.puzzle_shadows[i]

			//определяем размеры фигуры в у.е.
			const [figure_width,figure_height]=this.get_size(id)


			shadow.clear()
			shadow.beginFill(0x333333);

			//рисуем фигуру по ячейкам
			let p=0
			for (let pnt of figure){

				const y=pnt[0]
				const x=pnt[1]
				
				//вырезаем кусок текстуры
				const t=new PIXI.Texture(this.img_texture.baseTexture,new PIXI.Rectangle((sx+x)*CELL_ON_IMAGE_SIZE,(sy+y)*CELL_ON_IMAGE_SIZE,CELL_ON_IMAGE_SIZE,CELL_ON_IMAGE_SIZE))


				const cell=this.area_data[sy+y][sx+x]
				cell.fig_ind=i
				cell.cell_ind=p
				
				m_cells[p].texture=t
				m_cells[p].y=y*CELL_ON_STAGE_SIZE
				m_cells[p].x=x*CELL_ON_STAGE_SIZE
				m_cells[p].visible=true
				m_cells[p].width=CELL_ON_STAGE_SIZE
				m_cells[p].height=CELL_ON_STAGE_SIZE

				shadow.drawRect(x*CELL_ON_STAGE_SIZE, y*CELL_ON_STAGE_SIZE, CELL_ON_STAGE_SIZE, CELL_ON_STAGE_SIZE)
				p++
			}

			shadow.endFill()

			//запоминаем параметры блока
			block.id=id
			block.ind=i
			block.visible=true
			shadow.visible=true
			block.sy=sy
			block.sx=sx

			//вычисляем и рисуем обводку
			this.draw_comp_frame([i])

			i++
		}

		this.blocks_num=i
		this.fill_connect_info(i,w_total,h_total)

		//размещаем аккуратно блоки
		soft_placer.run(18,9)
		for (let i=0;i<this.blocks_num;i++){
			const block=objects.puzzle_blocks[i]
			puzzle.place_block_to_grid(block)

		}


	},

	send_composition_to_front(block_ids){

		//console.log('SENT_TO_FRONT',block_ids)
		let min_z=999999
		for (let ind of block_ids){
			const block=objects.puzzle_blocks[ind]
			min_z=Math.min(min_z,block.zIndex)
		}

		const z_shift=1+this.z-min_z
		for (let ind of block_ids){
			const block=objects.puzzle_blocks[ind]
			block.zIndex+=z_shift
			this.z=Math.max(this.z,block.zIndex)
		}
		objects.puzzle_cont.sortChildren()
	},

	get_figure_cell_pos(fig_ind, cell_ind){

		const figure=objects.puzzle_blocks[fig_ind]
		const cell_data=figures[figure.id][cell_ind]
		const ty=figure.gy+cell_data[0]
		const tx=figure.gx+cell_data[1]
		return [ty,tx]

	},

	get_comp_start_pos(comp){
		
		let miny=9999
		let minx=9999
		for (let ind of comp){
			const block=objects.puzzle_blocks[ind]
			miny=Math.min(miny,block.gy)
			minx=Math.min(minx,block.gx)
		}
		
		return [miny,minx]
	
	},

	hl_shape(comp){
		

		//первый элемент в композиции - держатель общей обводки и оверлея
		const holder_block=objects.puzzle_blocks[comp[0]]
		
		holder_block.overlay.clear()
		holder_block.overlay.beginFill(0xffffff)
			
		//рисуем оверлей
		for (let ind of comp){

			const block=objects.puzzle_blocks[ind]
			for (let pnt of figures[block.id]){

				const y=block.gy+pnt[0]-holder_block.gy
				const x=block.gx+pnt[1]-holder_block.gx

				holder_block.overlay.drawRect(x*CELL_ON_STAGE_SIZE, y*CELL_ON_STAGE_SIZE, CELL_ON_STAGE_SIZE, CELL_ON_STAGE_SIZE)

			}
		}
		
		anim3.add(holder_block.overlay,{alpha:[0.75,0,'linear']}, false, 1)
		//anim3.add(objects.hl,{x:[0,800,'linear']}, false, 1)

			
	},

	get_lines_from_comp(comp){
		
		//инициируем массив
		const nodes_area=Array(15).fill(0).map(()=>Array(15).fill(0))
		
		//определяем начало композишна
		const [miny,minx]=this.get_comp_start_pos(comp)
		
		//делаем узлы
		for (let ind of comp){

			const block=objects.puzzle_blocks[ind]
			for (let pnt of figures[block.id]){

				const y=block.gy+pnt[0]-miny
				const x=block.gx+pnt[1]-minx

				nodes_area[y][x]++
				nodes_area[y][x+1]++
				nodes_area[y+1][x+1]++
				nodes_area[y+1][x]++

			}
		}
		
		let start_point=0
		const h=nodes_area.length
		const w=nodes_area[0].length
		const lines=[]

		for (let y=0;y<h;y++){
			for (let x=0;x<w;x++){

				const cur_node=nodes_area[y][x]
				if (!start_point){
					if (cur_node==1||cur_node===3)
						start_point=[y,x]
				}else{
					if (cur_node==1||cur_node===3){
						lines.push([start_point[0],start_point[1],y,x])
						start_point=0
					}
				}
			}
		}

		for (let x=0;x<w;x++){
			for (let y=0;y<h;y++){

				const cur_node=nodes_area[y][x]
				if (!start_point){
					if (cur_node==1||cur_node===3)
						start_point=[y,x]
				}else{
					if (cur_node==1||cur_node===3){
						lines.push([start_point[0],start_point[1],y,x])
						start_point=0
					}
				}
			}
		}

		return lines
		
	},

	draw_comp_frame(comp){

		//первый элемент в композиции - держатель общей обводки и оверлея
		const holder_block=objects.puzzle_blocks[comp[0]]

		//убираем рамки у остальной композиции
		for (let i=1;i<comp.length;i++){
			const block=objects.puzzle_blocks[comp[i]]
			block.frame.visible=false
		}

		//вычисляем линии
		const lines=this.get_lines_from_comp(comp)
		
		//определяем начало композишна
		const [miny,minx]=this.get_comp_start_pos(comp)

		//разница между холдером и композицией
		const dy=miny-holder_block.gy
		const dx=minx-holder_block.gx

		holder_block.frame.clear()
		holder_block.frame.lineStyle({width:1.5,color:0xffffff,cap:'round'})
		holder_block.frame.tint=0x333333
		for (const line of lines){

			const sty=line[0]+dy
			const stx=line[1]+dx
			const eny=line[2]+dy
			const enx=line[3]+dx

			holder_block.frame.moveTo(stx*CELL_ON_STAGE_SIZE, sty*CELL_ON_STAGE_SIZE)
			holder_block.frame.lineTo(enx*CELL_ON_STAGE_SIZE, eny*CELL_ON_STAGE_SIZE)
		}

		//обновляем z индекс
		const ind=holder_block.ind
		holder_block.frame.visible=true
		//puzzle.send_composition_to_front([ind])
		//objects.puzzle_cont.sortChildren()

	},

	fill_connect_info(i,w,h){

		//заполняем информацию о коннектах
		const blocks_num=i
		for (let i=0;i<blocks_num;i++){

			const block=objects.puzzle_blocks[i]
			const pnts=figures[block.id]
			const sy=block.sy
			const sx=block.sx
			block.conn=[]

			p=0
			for (pnt of pnts){

				block.conn.push([])

				for (const dir of dirs){

					const ty=sy+pnt[0]+dir[0]
					const tx=sx+pnt[1]+dir[1]
					if (ty<0||tx<0||ty>=h||tx>=w) continue

					const cell_data=this.area_data[ty][tx]
					const tar_block_ind=cell_data.fig_ind
					if (tar_block_ind===i) continue

					block.conn[p].push({dy:dir[0],dx:dir[1],fig_ind:cell_data.fig_ind,cell_ind:cell_data.cell_ind})

				}

				p++
			}
		}
	},
	
	try_get_composition(drag_array){

		const comp=[...drag_array]
		let new_comp_flag=0
		for (let ind of drag_array){

			const block=objects.puzzle_blocks[ind]
			const cur_block_comp_ind=block.composition_ind
			const pnts_data=figures[block.id]
			const conn_data=block.conn

			p=0
			for (cell of conn_data){

				for (const conn of cell){

					const fig_ind=conn.fig_ind
					const cell_ind=conn.cell_ind
					const ty=block.gy+pnts_data[p][0]+conn.dy
					const tx=block.gx+pnts_data[p][1]+conn.dx
					const tar_block=objects.puzzle_blocks[fig_ind]
					const tar_block_comp_ind=tar_block.composition_ind

					const [tar_y,tar_x]=puzzle.get_figure_cell_pos(fig_ind,cell_ind)

					if (ty===tar_y&&tx===tar_x&&!comp.includes(fig_ind)){

						if (tar_block_comp_ind>=0){
							comp.push(...compositions[tar_block_comp_ind])
						}else{
							comp.push(fig_ind)
						}
						new_comp_flag=1
					}
				}
				p++
			}
		}

		return [comp,new_comp_flag]

	},

	close(){
		
		clearInterval(this.sec_timer)
		//objects.bcg.visible=false
		objects.puzzle_cont.visible=false
		objects.header_cont.visible=false
	}
}

let drag=0
let drag_sy=0
let drag_sx=0
let drag_array=[]
let compositions=[]

main_menu={
	
	order:[],
	scale:[0.8,0.9,1,0.9,0.8],
	posx:[-50,200,400,600,850],
	posy:[210,200,210,200,180],
	init_flag:0,
	sel_world:0,
	cur_world:0,
	cur_comp:0,
	preview_update_on:0,
	
	async activate(next_puzzle){
		
		objects.puzzle_menu_cont.visible=true		
		
		if (next_puzzle){
			if (this.cur_world===this.sel_world){
				const world_complete=await this.order[2].add_progress()
				all_completed++
				if (world_complete)
					await this.shift_worlds(1)
			}
		}
		
		const [n_world,n_pic]=this.get_next_world_and_pic()
		this.cur_world=n_world
		this.sel_world=n_world
		this.cur_comp=n_pic

		//тупо размещаем иконки уровней
		for (let i=0;i<5;i++){
			const icon=objects.worlds_icons[i]
			icon.scale_xy=this.scale[i]
			icon.x=this.posx[i]
			icon.y=this.posy[i]
			this.order[i]=icon

			const w_ind=this.sel_world-2+i
			const world_comp=Math.max(0,this.get_world_comp(w_ind))
			
			icon.set_world(w_ind,world_comp)
		}

		this.update_preview()

	},
	
	async update_preview(){
		
		if(this.preview_update_on) return
		
		this.preview_update_on=1
		let new_res=0
		for (const card of objects.worlds_icons){
			if (!card.visible) continue
			
			
			const w=card.world_ind
			const w_data=worlds_data[w]
			const theme=w_data.theme
			const w_size=w_data.pics.length
			const c=card.comp>=w_size?w_size-1:card.comp
			const pic_ind=w_data.pics[c]
			const res_name=`${theme}_${pic_ind}`
			
			if (card.res_assigned===res_name){
				//console.log('уже загружено')
				continue
			}
			
			if (img_loader.resources[res_name]){
				console.log('применили уже загруженное')
				card.set_bcg(res_name)
			}else{
				new_res=1
				console.log('загружаем ',`images/${theme}/${pic_ind}.jpg`)
				img_loader.add(res_name,`images/${theme}/${pic_ind}.jpg`)
			}			
		}
		
		
		if(new_res){
			console.log('загрузка....')
			await new Promise(res=>img_loader.load(res))
			console.log('завершено!')		
		}

		//заполняем
		for (const card of objects.worlds_icons){
			const w=card.world_ind
			const w_data=worlds_data[w]
			const w_size=w_data.pics.length
			const theme=w_data.theme
			const c=card.comp>=w_size?w_size-1:card.comp
			const pic_ind=w_data.pics[c]
			const res_name=`${theme}_${pic_ind}`
			const res=img_loader.resources[res_name]
			if (res)
				card.set_bcg(res_name)
		}
		
		this.preview_update_on=0
		setTimeout(()=>{this.update_preview()},1000)
	},
	
	get_next_world_and_pic(){
		
		let remains=all_completed
		for (let w=0;w<worlds_data.length;w++){
			
			const worlds_size=worlds_data[w].pics.length
			if (remains>=worlds_size){
				remains-=worlds_size
			}else{
				return [w,remains]
			}			
		}		
	},
	
	get_world_comp(w_ind){		
		
		if (w_ind<0) return 0
		
		let remains=all_completed
		for (let w=0;w<w_ind;w++){
			const worlds_size=worlds_data[w].pics.length
			remains-=worlds_size
		}
		
		const tar_worlds_size=worlds_data[w_ind].pics.length
		if (remains>=tar_worlds_size) return tar_worlds_size
		//if (remains<=0) return 0
		return remains
		
	},
	
	start_down(){
		
		if (anim3.any_on()){
			return
		}
				
		if (this.order[2].lock_icon.visible)
			return
				
		puzzle.activate(this.sel_world)
		this.close()
	},
		
	async shift_worlds(dir){
		
		//проверяем следующий уровень
		const next_level=this.sel_world+dir;

		//если это последний уровень
		if (next_level===worlds_data.length){
			sound.play('locked')
			return;
		}

		//если отрицательный уровень
		if (next_level<0){
			sound.play('locked')
			return;
		}

		this.sel_world=next_level

		if (dir===1){
			const first=this.order.shift();
			first.x=700;
			this.order.push(first)
			first.set_world(this.sel_world+2)
		}else{
			const last=this.order.pop()
			last.x=0;
			this.order.unshift(last)
			last.set_world(this.sel_world-2)
		}		

		//перемещаем иконки уровней
		for (let i=0;i<5;i++){
			const icon=this.order[i];
			if (icon.visible)
				anim3.add(icon,{x:[icon.x, this.posx[i],'easeOutBack'],y:[icon.y,this.posy[i],'linear'],scale_xy:[icon.scale_xy,this.scale[i],'linear']}, true, 0.25);
		}
		
		await anim3.wait(0.25)
		
	},
		
	switch_down(dir){
		
		if(anim3.any_on()){
			sound.play('locked');
			return;
		}

		sound.play('click')
		
		this.shift_worlds(dir)
		
	},
	
	close(){
		
		some_process.anim_bcg=()=>{}
		objects.puzzle_menu_cont.visible=false
		//objects.anim_bcg.visible=false
		//objects.anim_bcg_overlay.visible=false
	}
}

function search_lines(lines){

	//выбирем начальную точку
	cur_pnt_y=lines[0][0]
	cur_pnt_x=lines[0][1]
	checked_lines=[]
	poly=[]

	for(let z=0;z<100;z++){
		
		if (lines.length===checked_lines.length){
			return poly
		}

		for (line of lines){

			if (checked_lines.includes(line))
				continue

			if (line[0]===cur_pnt_y&&line[1]===cur_pnt_x){
				poly.push(line[3],line[2])
				cur_pnt_y=line[2]
				cur_pnt_x=line[3]
				checked_lines.push(line)
				break
			}

			if (line[2]===cur_pnt_y&&line[3]===cur_pnt_x){
				poly.push(line[1],line[0])
				cur_pnt_y=line[0]
				cur_pnt_x=line[1]
				checked_lines.push(line)
				break
			}
		}
	}
}

function draw_snap_block(drag_array){
		
	const lines=puzzle.get_lines_from_comp(drag_array)
	const [miny,minx]=puzzle.get_comp_start_pos(drag_array)
	const poly=search_lines(lines)
	
	objects.snap_shape.clear()
	objects.snap_shape.lineStyle({width:2,color:0xffffff,cap:'round'})
	objects.snap_shape.sy=objects.snap_shape.y=0
	objects.snap_shape.sx=objects.snap_shape.x=0
	
	for (let i=0;i<poly.length/2;i++){

		poly[i*2]=(poly[i*2]+minx)*CELL_ON_STAGE_SIZE
		poly[i*2+1]=(poly[i*2+1]+miny)*CELL_ON_STAGE_SIZE
	}
	
	objects.snap_shape.drawPolygon(poly)
	objects.snap_shape.endFill()
	
}

function block_down(e){

	//увеличиваем касания
	puzzle.inc_touches()

	drag=1
	drag_sy=e.data.global.y/app.stage.scale.y
	drag_sx=e.data.global.x/app.stage.scale.x

	if (this.composition_ind>=0)
		drag_array=compositions[this.composition_ind]
	else
		drag_array=[this.ind]
	
	objects.snap_shape.visible=true
	//objects.snap_bcg.visible=true

	for (let ind of drag_array){
		const block=objects.puzzle_blocks[ind]
		// block.zIndex+=10
		block.sy=block.y
		block.sx=block.x
		block.frame.tint=0xffff00
		objects.puzzle_shadows[ind].visible=false
		block.m_cells.forEach(c=>c.alpha=0.75)
	}

	//обновляем z индекс
	puzzle.send_composition_to_front(drag_array)
	draw_snap_block(drag_array)

}

async function block_up(e){

	drag=0

	for (let m of drag_array){
		const block=objects.puzzle_blocks[m]
		block.frame.tint=0x333333
		block.m_cells.forEach(c=>c.alpha=1)
		objects.puzzle_shadows[m].visible=true
		snap_block(block)
	}
	await anim3.wait(0.1)

	//compositions=[]
	const [comp,new_comp_flag]=puzzle.try_get_composition(drag_array)
	if (new_comp_flag){

		compositions.push([])
		const new_comp_ind=compositions.length-1
		const new_comp=compositions[new_comp_ind]
		for (let i=0;i<comp.length;i++){
			const ind=comp[i]
			new_comp.push(ind)
			objects.puzzle_blocks[ind].composition_ind=new_comp_ind
		}

		puzzle.draw_comp_frame(comp)
		puzzle.hl_shape(comp)
		assets.snap2.play()

		if (new_comp.length===puzzle.blocks_num){
			puzzle.close_puzzle()
		}

	}else{
		assets.snap1.play()
	}

	puzzle.send_composition_to_front(comp)

	objects.snap_shape.visible=false

}

async function snap_block(block){

	const tx=block.x
	const ty=block.y

	block.gy=Math.round(ty / CELL_ON_STAGE_SIZE)
	block.gx=Math.round(tx / CELL_ON_STAGE_SIZE)

	await puzzle.place_block_to_grid(block)
}

function mouse_move(e){

	if(!drag) return
	if(!drag_array) return

	const my=e.data.global.y/app.stage.scale.y
	const mx=e.data.global.x/app.stage.scale.x

	const dx=mx-drag_sx
	const dy=my-drag_sy
	
	
	objects.snap_shape.x=objects.snap_shape.sx+dx
	objects.snap_shape.y=objects.snap_shape.sy+dy
	snap_block(objects.snap_shape)
	
	

	//draw_snap_block(drag_array)

	for (const ind of drag_array){
		const block=objects.puzzle_blocks[ind]
		block.y=block.sy+dy
		block.x=block.sx+dx

		objects.puzzle_shadows[ind].y=block.y+5
		objects.puzzle_shadows[ind].x=block.x+5
	}

}

async function init_game_env(lang) {


	//создаем приложение пикси и добавляем тень
	//создаем приложение пикси и добавляем тень
	const dw=M_WIDTH/document.body.clientWidth;
	const dh=M_HEIGHT/document.body.clientHeight;
	const resolution=Math.max(dw,dh,1);
	const opts={width:800, height:450,antialias:false,resolution,autoDensity:true};
	app.stage = new PIXI.Container();
	app.renderer = new PIXI.Renderer(opts);
	document.body.appendChild(app.renderer.view).style["boxShadow"] = "0 0 15px #000000";
	document.body.style.backgroundColor = 'rgb(141,211,200)';

	await main_loader.load1()
	//addEventListener("mousemove", e => {mouse_move(e)})
	//запускаем главный цикл
	main_loop()	

	resize();
	window.addEventListener("resize", resize);

	main_menu.activate()

}

function main_loop() {

	game_tick+=0.016666666;
	
	//обрабатываем минипроцессы
	for (let key in some_process)
		some_process[key]();
	
	app.renderer.render(app.stage);
	anim3.process();
	requestAnimationFrame(main_loop);
}

