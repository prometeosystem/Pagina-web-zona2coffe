document.addEventListener('DOMContentLoaded', () => {
	const burger = document.getElementById('burger');
	const check = document.getElementById('check');
	const nav = document.getElementById('menu-nav');
	let menuAbierto = false;

	const abrirMenu = () => {
		nav.style.display = 'flex';
		nav.classList.add('abierto-nav');
		burger.classList.remove('abierto');
		menuAbierto = true;
	};

	const cerrarMenu = () => {
		nav.classList.remove('abierto-nav');
		nav.style.display = 'none';
		burger.classList.add('abierto');
		check.checked = false;
		menuAbierto = false;
	};

	check.addEventListener('change', () => {
		if (!menuAbierto) abrirMenu();
		else cerrarMenu();
	});

	document.querySelectorAll('.desplazamiento').forEach((enlace) => {
		enlace.addEventListener('click', (evento) => {
			evento.preventDefault();
			const destino = document.querySelector(enlace.getAttribute('href'));
			if (!destino) return;
			const top = destino.getBoundingClientRect().top + window.scrollY - 80;
			window.scrollTo({ top, behavior: 'smooth' });
			cerrarMenu();
		});
	});

	document.querySelectorAll('.abrir-carta').forEach((enlace) => {
		enlace.addEventListener('click', (evento) => {
			evento.preventDefault();
			const visor = document.getElementById('visor-carta');
			const foto = document.getElementById('visor-carta-img');
			if (!visor || !foto) return;
			foto.src = enlace.getAttribute('href');
			foto.alt = enlace.textContent.trim();
			visor.hidden = false;
			document.body.classList.add('carta-abierta');
		});
	});

	const cerrarCarta = () => {
		const visor = document.getElementById('visor-carta');
		const foto = document.getElementById('visor-carta-img');
		if (!visor) return;
		visor.hidden = true;
		if (foto) foto.src = '';
		document.body.classList.remove('carta-abierta');
	};

	document.getElementById('visor-cerrar')?.addEventListener('click', cerrarCarta);
	document.getElementById('visor-carta')?.addEventListener('click', (evento) => {
		if (evento.target.id === 'visor-carta') cerrarCarta();
	});
	document.addEventListener('keydown', (evento) => {
		if (evento.key === 'Escape') cerrarCarta();
	});

	new Swiper('.home > aside', {
		speed: 2000,
		slidesPerView: 1,
		spaceBetween: 0,
		loop: true,
		autoplay: {
			delay: 2500,
			pauseOnMouseEnter: false,
		},
	});

	new Swiper('.galeria-espacio', {
		speed: 400,
		loop: true,
		effect: 'fade',
		fadeEffect: { crossFade: false },
		autoplay: {
			delay: 300,
			pauseOnMouseEnter: false,
		},
	});

	if (window.AOS) AOS.init();

	cargarResenasGoogle();

	if (!window.gsap || !window.ScrollTrigger) return;

	gsap.registerPlugin(ScrollTrigger);

	const movil = window.matchMedia('(max-width: 900px)').matches;

	gsap.fromTo('.ritmo h2',
		{ xPercent: movil ? 16 : 45 },
		{
			xPercent: 0,
			ease: 'none',
			scrollTrigger: {
				trigger: '.ritmo',
				start: 'top 85%',
				end: 'top 35%',
				scrub: true,
			},
		}
	);

	gsap.fromTo('.circulos',
		{ scale: movil ? 1.2 : 2.4 },
		{
			scale: 1,
			ease: 'power1.out',
			scrollTrigger: {
				trigger: '.ritmo-duo',
				start: 'top 90%',
				end: 'top 55%',
				scrub: true,
			},
		}
	);

	gsap.fromTo('.ilustracion-wrap',
		{ xPercent: movil ? 12 : 40 },
		{
			xPercent: 0,
			ease: 'power1.inOut',
			scrollTrigger: {
				trigger: '.ritmo-duo',
				start: 'top 85%',
				scrub: true,
			},
		}
	);

	gsap.fromTo('.quienes-somos h2',
		{ xPercent: movil ? -40 : -110 },
		{
			xPercent: 0,
			ease: 'power1.inOut',
			scrollTrigger: {
				trigger: '.quienes-somos',
				start: 'top 85%',
				end: 'top 40%',
				scrub: true,
			},
		}
	);

	gsap.fromTo('.quienes-somos h1',
		{ xPercent: movil ? -40 : -110 },
		{
			xPercent: 0,
			ease: 'power1.inOut',
			scrollTrigger: {
				trigger: '.quienes-somos',
				start: 'top 80%',
				end: 'top 30%',
				scrub: true,
			},
		}
	);

	gsap.fromTo('.quienes-somos p',
		{ xPercent: movil ? -28 : -90 },
		{
			xPercent: 0,
			ease: 'power1.inOut',
			scrollTrigger: {
				trigger: '.quienes-somos',
				start: 'top 70%',
				end: 'top 25%',
				scrub: true,
			},
		}
	);

	gsap.fromTo('.experiencia > aside h1',
		{ xPercent: movil ? -35 : -200 },
		{
			xPercent: 0,
			ease: 'power1.inOut',
			scrollTrigger: {
				trigger: '.quienes-somos',
				start: 'bottom center',
				scrub: true,
			},
		}
	);

	gsap.fromTo('.experiencia > aside > h2',
		{ xPercent: movil ? 35 : 200 },
		{
			xPercent: 0,
			ease: 'power1.inOut',
			scrollTrigger: {
				trigger: '.quienes-somos',
				start: 'bottom center',
				scrub: true,
			},
		}
	);

	gsap.fromTo('.experiencia > aside > div > aside.svg-1',
		{ xPercent: movil ? 30 : 200 },
		{
			xPercent: 0,
			ease: 'power1.inOut',
			scrollTrigger: {
				trigger: '.experiencia > aside > h1',
				start: 'top center',
				scrub: true,
			},
		}
	);

	gsap.fromTo('.experiencia > aside > div > aside.svg-2',
		{ xPercent: movil ? -30 : -200 },
		{
			xPercent: 0,
			ease: 'power1.inOut',
			scrollTrigger: {
				trigger: '.experiencia > aside > h1',
				start: 'top center',
				scrub: true,
			},
		}
	);
});

function estrellasTexto(rating) {
	const llenas = Math.round(Number(rating) || 0);
	return '★★★★★'.slice(0, llenas) + '☆☆☆☆☆'.slice(0, 5 - llenas);
}

function pintarResenas(lugar) {
	const numero = document.getElementById('rating-numero');
	const estrellas = document.getElementById('estrellas-google');
	const lista = document.getElementById('resenas-lista');
	if (!lugar || !numero) return;

	const rating = lugar.rating;
	const total = lugar.userRatingCount;
	if (rating) {
		estrellas.textContent = estrellasTexto(rating);
		numero.textContent = `${rating.toFixed(1)} · ${total || 0} reseñas en Google`;
	}

	const opiniones = (lugar.reviews || []).slice(0, 5);
	if (!opiniones.length || !lista) return;

	lista.innerHTML = opiniones.map((r) => {
		const autor = r.authorAttribution?.displayName || 'Cliente de Google';
		const texto = r.text?.text || r.originalText?.text || '';
		const nota = r.rating ? estrellasTexto(r.rating) : '';
		return `<article class="resena-card">
			<strong>${autor}</strong>
			<span>${nota}</span>
			<p>${texto}</p>
		</article>`;
	}).join('');
}

async function cargarResenasGoogle() {
	const clave = window.ZONA2_GOOGLE_KEY;
	if (!clave) return;

	try {
		const respuesta = await fetch('https://places.googleapis.com/v1/places:searchText', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-Goog-Api-Key': clave,
				'X-Goog-FieldMask': 'places.displayName,places.rating,places.userRatingCount,places.reviews',
			},
			body: JSON.stringify({
				textQuery: 'Zona 2 Coffee Recovery C. Ceres 109 Delicias Cuernavaca',
				languageCode: 'es',
			}),
		});
		if (!respuesta.ok) return;
		const datos = await respuesta.json();
		if (datos.places && datos.places[0]) pintarResenas(datos.places[0]);
	} catch (error) {
		console.warn('No se pudieron cargar las reseñas de Google', error);
	}
}
