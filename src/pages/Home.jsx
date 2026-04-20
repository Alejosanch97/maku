import React, { useEffect, useState, useRef } from "react";
import "../Styles/home.css";
import { Link } from "react-router-dom";
import { useNavigate, useLocation } from "react-router-dom";

const sections = [
    { id: "hero-section", label: "Inicio" },
    { id: "the-moment", label: "El Momento" },
    { id: "experience", label: "Experiencia" },
    { id: "ingredients", label: "Fórmula" },
    { id: "lifecycle", label: "Tu Ciclo" },
    { id: "testimonials", label: "Comunidad" },
    { id: "products", label: "Pedir" }
];

const chapters = [
    { id: "shop", title: "Mercado Maku", sub: "Tienda oficial", isShop: true },
    { id: "hero-section", title: "Origen", sub: "Inicio y nuestra historia", target: "hero-section" },
    { id: "experience", title: "Esencia", sub: "Experiencia y fórmula única", target: "experience" },
    { id: "testimonials", title: "Tribu", sub: "Comunidad y estilo de vida", target: "testimonials" },
];
export const Home = () => {
    const [loaded, setLoaded] = useState(false);
    const [activeSection, setActiveSection] = useState("hero-section");
    const [videoStarted, setVideoStarted] = useState(false);
    const [isVideoFinished, setIsVideoFinished] = useState(false);
    const [scrollPercentage, setScrollPercentage] = useState(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isNavigatingByClick, setIsNavigatingByClick] = useState(false);

    const videoRef = useRef(null);

    useEffect(() => {
        setLoaded(true);
    }, []);

    // Lógica de Scroll, Sincronización y Círculo de Progreso
    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrolled = (scrollTop / docHeight) * 100;

            setScrollPercentage(scrolled);

            // Disparar video al bajar un poco
            if (scrollTop > 20 && !videoStarted && !isVideoFinished) {
                setVideoStarted(true);
                videoRef.current?.play().catch((err) => console.log("Video error", err));
            }

            // RESET al volver arriba de todo
            if (scrollTop < 5) {
                setVideoStarted(false);
                setIsVideoFinished(false);
                if (videoRef.current) {
                    videoRef.current.pause();
                    videoRef.current.currentTime = 0;
                }
            }

            // Actualización de navegación activa
            let current = "";
            sections.forEach((section) => {
                const element = document.getElementById(section.id);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    if (rect.top <= window.innerHeight / 2) current = section.id;
                }
            });
            setActiveSection(current || "hero-section");
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [videoStarted, isVideoFinished]);

    // MANEJO DEL BLOQUEO DE VIDEO (Lock a 800px hasta que termine)
    useEffect(() => {
        const checkLock = () => {
            const scrollTop = window.scrollY;
            // Si estamos navegando por clic o el menú está abierto, NO bloqueamos a 800px
            if (videoStarted && !isVideoFinished && scrollTop >= 790 && !isNavigatingByClick && !isMenuOpen) {
                document.body.style.overflow = "hidden";
                window.scrollTo(0, 790);
            } else {
                // Si el menú está abierto, bloqueamos el scroll del fondo
                document.body.style.overflow = isMenuOpen ? "hidden" : "auto";
            }
        };
        const interval = setInterval(checkLock, 10);
        return () => {
            clearInterval(interval);
            document.body.style.overflow = "auto";
        };
    }, [videoStarted, isVideoFinished, isNavigatingByClick, isMenuOpen]);

    const handleManualNav = (e, targetId) => {
        e.preventDefault();
        setIsNavigatingByClick(true); // Apagamos el bloqueo de seguridad
        setIsVideoFinished(true);    // Forzamos el estado de video terminado para limpiar el layout

        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            // Un pequeño timeout para asegurar que el overflow: auto se aplicó
            setTimeout(() => {
                targetElement.scrollIntoView({ behavior: "smooth" });

                // Opcional: Volver a permitir el bloqueo después de que llegue (si el usuario sube)
                // Aunque usualmente si ya hizo clic, es mejor dejarlo libre.
            }, 50);
        }
    };

    const handleVideoEnd = () => {
        setIsVideoFinished(true);

        document.body.style.overflow = "auto";

        // Desactivamos scroll snap temporalmente
        document.documentElement.classList.add("no-snap");

        setTimeout(() => {
            const nextSection = document.getElementById("the-moment");

            if (nextSection) {
                // 🔥 Ajusta este valor hasta que quede PERFECTO visualmente
                const offset = 380;

                const y = nextSection.offsetTop - offset;

                window.scrollTo({
                    top: y,
                    behavior: "smooth"
                });
            }

            // Reactivamos scroll snap después de la animación
            setTimeout(() => {
                document.documentElement.classList.remove("no-snap");
            }, 800);

        }, 100);
    };

    const videoSrc = "https://uwlcypetrdjkeoxpyldq.supabase.co/storage/v1/object/public/maku/870b2b0c-a7e0-4f5f-acd7-646e99d4c6bc.mp4";
    // Esta imagen debe ser exactamente el último frame de tu video para que sea fluido
    const initialImage = "https://res.cloudinary.com/deafueoco/image/upload/v1776181903/Generated_Image_April_14_2026_-_10_06AM_dbzkhy.png";

    const navigate = useNavigate();
    const location = useLocation();

    const handleNavigation = (e, targetId) => {
        if (e) e.preventDefault();

        setIsMenuOpen(false); // Cerramos el menú siempre

        // 1. Si el usuario está en /tienda y hace clic en un capítulo de la Home
        if (location.pathname !== "/") {
            navigate("/"); // Lo mandamos a la Home

            // Esperamos a que cargue la Home para hacer el scroll
            setTimeout(() => {
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    // Forzamos el estado para que el scroll no se bloquee por el video
                    if (typeof setIsVideoFinished === "function") setIsVideoFinished(true);
                    targetElement.scrollIntoView({ behavior: "smooth" });
                }
            }, 500);
            return;
        }

        // 2. Si ya estamos en la Home, ejecutamos el scroll con tus bloqueos de seguridad
        if (typeof setIsNavigatingByClick === "function") setIsNavigatingByClick(true);
        if (typeof setIsVideoFinished === "function") setIsVideoFinished(true);

        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            setTimeout(() => {
                targetElement.scrollIntoView({ behavior: "smooth" });

                // Rehabilitamos el control de scroll después de 1.2 segundos
                setTimeout(() => {
                    if (typeof setIsNavigatingByClick === "function") setIsNavigatingByClick(false);
                }, 1200);
            }, 100);
        }
    };

    return (
        <div className="maku-landing">
            {/* NAVBAR TRANSPARENTE */}
            <header className="maku-navbar">
                <div className="nav-container">
                    <div className="nav-logo" onClick={(e) => handleNavigation(e, "hero-section")}>
                        MAKU <span>ALIMENTOS</span>
                    </div>
                    <button
                        className={`menu-hamburger ${isMenuOpen ? "is-open" : ""}`}
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <span className="line"></span>
                        <span className="line"></span>
                    </button>
                </div>
            </header>

            {/* OVERLAY DE MENÚ PANTALLA COMPLETA */}
            <nav className={`maku-menu-overlay ${isMenuOpen ? "is-visible" : ""}`}>
                <div className="menu-content">
                    <div className="menu-chapters">
                        {chapters.map((ch, index) => {
                            // CASO A: ES LA TIENDA (Navegación de Página)
                            if (ch.isShop) {
                                return (
                                    <Link
                                        key={ch.id}
                                        to="/tienda"
                                        className="menu-item shop-special"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <div className="item-wrapper">
                                            <span className="item-label">CHAPTER 0{index + 1}</span>
                                            <h2 className="item-title">{ch.title}</h2>
                                            <p className="item-description">{ch.sub}</p>
                                        </div>
                                        <span className="badge-pronto">MERCADO</span>
                                    </Link>
                                );
                            }

                            // CASO B: ES UN CAPÍTULO (Scroll Suave)
                            return (
                                <a
                                    key={ch.id}
                                    href={`#${ch.target}`}
                                    onClick={(e) => handleNavigation(e, ch.target)}
                                    className="menu-item"
                                >
                                    <div className="item-wrapper">
                                        <span className="item-label">CHAPTER 0{index + 1}</span>
                                        <h2 className="item-title">{ch.title}</h2>
                                        <p className="item-description">{ch.sub}</p>
                                    </div>
                                </a>
                            );
                        })}
                    </div>
                </div>
            </nav>

            {/* WIDGET DE PROGRESO (CIRCULITO) */}
            <div className="maku-progress-container">
                <svg className="maku-progress-svg" viewBox="0 0 100 100">
                    <circle className="maku-progress-bg" cx="50" cy="50" r="45" />
                    <circle
                        className="maku-progress-bar"
                        cx="50" cy="50" r="45"
                        style={{ strokeDashoffset: 283 - (283 * scrollPercentage) / 100 }}
                    />
                </svg>
                <div className="maku-progress-dot" />
            </div>

            {/* NAVEGACIÓN LATERAL */}
            <nav className="side-dots-nav">
                {sections.map((section) => (
                    <a
                        key={section.id}
                        href={`#${section.id}`}
                        className={`dot-item ${activeSection === section.id ? "is-active" : ""}`}
                    >
                        <span className="dot-label">{section.label}</span>
                    </a>
                ))}
            </nav>

            {/* HERO SECTION */}
            <div
                id="hero-section"
                className="hero-scroll-wrapper"
                style={{
                    height: isVideoFinished ? "100vh" : "180vh",
                    transition: "height 0.8s cubic-bezier(0.16, 1, 0.3, 1)"
                }}
            >
                <div className="sticky-wrapper">
                    <video
                        ref={videoRef}
                        className="background-media-video"
                        muted
                        playsInline
                        onEnded={handleVideoEnd}
                        style={{
                            // El video se oculta al terminar para mostrar la imagen estática perfecta
                            opacity: isVideoFinished ? 0 : 1,
                            transition: "opacity 0.5s ease"
                        }}
                    >
                        <source src={videoSrc} type="video/mp4" />
                    </video>

                    <div
                        className="initial-poster"
                        style={{
                            backgroundImage: `url(${initialImage})`,
                            // La imagen solo es visible antes de empezar y después de terminar
                            opacity: videoStarted && !isVideoFinished ? 0 : 1,
                            transition: 'opacity 0.8s ease'
                        }}
                    />

                    <div className="overlay-vignette" />

                    <section className="hero-text-layer"
                        style={{
                            transform: isVideoFinished ? `translateY(-${(window.scrollY - 800) * 0.5}px)` : `translateY(0px)`,
                            opacity: isVideoFinished ? (1 - (window.scrollY - 800) / 400) : 1
                        }}
                    >
                        <div className={`hero-content-split ${loaded ? 'is-loaded' : ''}`}>
                            <div className="hero-side left-side">
                                <h1 className="maku-title-vertical">
                                    <span className="char">MAKU</span>
                                </h1>
                            </div>
                            <div className="hero-side right-side">
                                <div className="right-content-inner">
                                    <span className="pre-title">Premium Granola</span>
                                    <h2 className="maku-tagline">
                                        <span className="main-tagline">Origen Natural</span>
                                    </h2>
                                    <div className="cta-group">
                                        {/* Botón de Explorar Sabores */}
                                        <Link
                                            to="/tienda"
                                            className="cta-minimal-pill"
                                            onClick={() => {
                                                // Opcional: Aseguramos que el scroll empiece arriba en la nueva página
                                                window.scrollTo(0, 0);
                                            }}
                                        >
                                            Explorar Sabores
                                        </Link>

                                        {/* Botón de Nuestra Historia */}
                                        <a
                                            href="#the-moment"
                                            className="cta-link-sophisticated"
                                            onClick={(e) => handleManualNav(e, "the-moment")}
                                        >
                                            Nuestra Historia <span className="link-line"></span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="scroll-hint-minimal" style={{ opacity: videoStarted ? 0 : 1 }}>
                            <div className="mouse-icon"><div className="wheel"></div></div>
                            <span>Desliza para empezar</span>
                        </div>
                    </section>
                </div>
            </div>

            <div className="content-overlay-rest">

                {/* 1. SECCIÓN: EL MOMENTO */}
                <section id="the-moment" className="maku-section-sensorial">
                    <div className="maku-container-inner">
                        <div className="maku-sensorial-card">
                            <span className="maku-badge">Advertencia: No es una granola común</span>
                            <h2 className="maku-big-statement">
                                Hay placeres que no se explican, <br />
                                <span>se escuchan en cada bocado.</span>
                            </h2>
                            <div className="maku-text-columns">
                                <p>Maku no nació para ser “otra granola más”. Nació para obsesionarte con el crunch perfecto. Tostada artesanalmente, con ese equilibrio exacto entre lo crocante, lo natural y lo absolutamente irresistible.</p>
                                <p className="maku-highlight-text">¿Sientes eso? Es el aroma a coco y semillas de calabaza inundando tu mañana. Una vez que abres el frasco, tu desayuno nunca volverá a ser el mismo.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. SECCIÓN: EXPERIENCIA */}
                <section id="experience" className="maku-section-experience">
                    <div className="maku-section-header" data-aos="fade-up">
                        <span className="maku-badge-gold">El Efecto Maku</span>
                        <h2 className="maku-title-md">La anatomía de un <br /><span>vicio saludable.</span></h2>
                    </div>

                    <div className="maku-experience-grid">
                        {[
                            {
                                title: "Energía sin Picos",
                                desc: "Carbohidratos de absorción lenta que te mantienen activo sin el bajón del azúcar procesada.",
                                tag: "Balance",
                                icon: "⚡"
                            },
                            {
                                title: "Crunch Terapéutico",
                                desc: "Un horneado tan preciso que el sonido de cada bocado se vuelve tu momento favorito del día.",
                                tag: "Sensorial",
                                icon: "🥣"
                            },
                            {
                                title: "Saciedad Real",
                                desc: "Densidad nutricional que calma el hambre de verdad, ideal para tus mañanas más exigentes.",
                                tag: "Nutrición",
                                icon: "💪"
                            },
                            {
                                title: "Hecho a Mano",
                                desc: "Lotes pequeños creados con atención al detalle, garantizando frescura en cada frasco.",
                                tag: "Artesanal",
                                icon: "📜"
                            }
                        ].map((card, index) => (
                            <div key={index} className="maku-exp-card" data-aos="fade-up" data-aos-delay={index * 150}>
                                <div className="maku-card-top">
                                    <span className="maku-card-tag">{card.tag}</span>
                                    <span className="maku-card-number">0{index + 1}</span>
                                </div>
                                <div className="maku-card-icon">{card.icon}</div>
                                <div className="maku-card-content">
                                    <h3>{card.title}</h3>
                                    <p>{card.desc}</p>
                                </div>
                                <div className="maku-card-footer">
                                    <div className="maku-footer-line"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 3. SECCIÓN: FÓRMULA (Ingredientes) */}
                <section id="ingredients" className="maku-ingredients-section">
                    <div className="maku-section-header" data-aos="fade-up">
                        <span className="maku-badge-gold">Nuestra Alquimia</span>
                        <h2 className="maku-big-title">Ingredientes que vibran, <br /><span>recetas que enamoran.</span></h2>
                    </div>

                    <div className="maku-alchemy-grid">
                        {/* Lado Izquierdo: Los Protagonistas */}
                        <div className="maku-alchemy-col left">
                            <div className="maku-ingredient-card" data-aos="fade-right">
                                <div className="maku-ing-img-box">
                                    <img src="https://i.pinimg.com/736x/70/d2/74/70d274056850006a18d6ee50a503385e.jpg" alt="Horneado" />
                                </div>
                                <div className="maku-ing-info">
                                    <h3>El Ritual del Fuego</h3>
                                    <p>Caramelizamos a fuego lento hasta alcanzar ese dorado ámbar.</p>
                                </div>
                            </div>

                            <div className="maku-ingredient-card" data-aos="fade-right" data-aos-delay="100">
                                <div className="maku-ing-img-box">
                                    <img src="https://i.pinimg.com/736x/41/f2/88/41f2883491daa97b85ec25b7966b46a9.jpg" alt="Miel" />
                                </div>
                                <div className="maku-ing-info">
                                    <h3>Oro Líquido</h3>
                                    <p>Miel pura que abraza cada ingrediente sin procesos químicos.</p>
                                </div>
                            </div>

                            <div className="maku-ingredient-card" data-aos="fade-right" data-aos-delay="200">
                                <div className="maku-ing-img-box">
                                    <img src="https://i.pinimg.com/736x/e2/8a/85/e28a8561909aa55bde0a67a57d9d0991.jpg" alt="Coco" />
                                </div>
                                <div className="maku-ing-info">
                                    <h3>Nieve Tropical</h3>
                                    <p>Láminas de coco real que aportan aroma y sedosidad.</p>
                                </div>
                            </div>
                        </div>

                        {/* Centro: La Pieza Maestra */}
                        <div className="maku-alchemy-center" data-aos="zoom-in">
                            <div className="maku-hero-product">
                                <div className="maku-floating-badge">EL MIX PERFECTO</div>
                                <div className="maku-image-container">
                                    <img src="https://i.pinimg.com/1200x/3e/64/28/3e6428ad5a790a7dcd1de6b9fc80c435.jpg" className="maku-final-jar" alt="Maku Granola Final" />
                                </div>
                                <div className="maku-serve-options">
                                    <button className="maku-serve-btn">🥛 Con Leche</button>
                                    <button className="maku-serve-btn">🥣 Con Yogurt</button>
                                </div>
                            </div>
                        </div>

                        {/* Lado Derecho: Los Potenciadores */}
                        <div className="maku-alchemy-col right">
                            <div className="maku-ingredient-card right-align" data-aos="fade-left">
                                <div className="maku-ing-info">
                                    <h3>Poder Cerebral</h3>
                                    <p>Nuez del nogal seleccionada para alimentar tu enfoque diario.</p>
                                </div>
                                <div className="maku-ing-img-box">
                                    <img src="https://i.pinimg.com/736x/74/f9/5e/74f95e374d8c697719367d72672e8f58.jpg" alt="Nuez" />
                                </div>
                            </div>

                            <div className="maku-ingredient-card right-align" data-aos="fade-left" data-aos-delay="100">
                                <div className="maku-ing-info">
                                    <h3>La Joya Verde</h3>
                                    <p>Semillas de calabaza, el toque mineral que hace a Maku inteligente.</p>
                                </div>
                                <div className="maku-ing-img-box">
                                    <img src="https://i.pinimg.com/736x/28/94/46/289446a232a0527fdc0f4edbd8b8858c.jpg" alt="Calabaza" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4. SECCIÓN: EL CICLO (Timeline) */}
                <section id="lifecycle" className="maku-section-lifecycle">
                    <div className="maku-lifecycle-inner">
                        <div className="maku-timeline-header" data-aos="fade-up">
                            <span className="maku-timeline-badge">Cronología de un Vicio</span>
                            <h2 className="maku-timeline-title">Tu primera vez con Maku</h2>
                        </div>

                        <div className="maku-timeline-grid">
                            {[
                                { time: "00:01", title: "La Intención", desc: "Dices que solo vas a probar un poquito." },
                                { time: "00:05", title: "El Hallazgo", desc: "El primer crunch te vuela la cabeza." },
                                { time: "00:15", title: "La Negación", desc: "Sirves un segundo plato. 'Mañana entreno'." },
                                { time: "01:00", title: "La Realidad", desc: "Viendo una serie... el frasco bajó a la mitad." }
                            ].map((step, i) => (
                                <div key={i} className="maku-timeline-card" data-aos="fade-up" data-aos-delay={i * 100}>
                                    <span className="maku-time-tag">{step.time}</span>
                                    <div className="maku-card-text">
                                        <h4>{step.title}</h4>
                                        <p>{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 5. SECCIÓN: TESTIMONIALES */}
                <section id="testimonials" className="maku-section-testimonials">
                    <div className="maku-testimonials-inner">
                        <div className="maku-wall-header" data-aos="fade-up">
                            <span className="maku-badge-dark">Voz de la Tribu</span>
                            <h2 className="maku-testimonials-title">Confesiones <span>Maku</span></h2>
                            <p className="maku-testimonials-subtitle">No lo decimos nosotros, lo dicen los que ya no pueden parar.</p>
                        </div>

                        <div className="maku-testimonials-masonry">
                            {/* Tarjeta 1 */}
                            <div className="maku-t-card" data-aos="zoom-in">
                                <div className="maku-t-rating">★★★★★</div>
                                <p>“Compré el frasco grande para el mes. Duró 3 días. <strong>Ayuda.</strong>”</p>
                                <span className="maku-t-author">— @caro_fit</span>
                            </div>

                            {/* Tarjeta 2 */}
                            <div className="maku-t-card featured" data-aos="zoom-in" data-aos-delay="100">
                                <div className="maku-t-rating">★★★★★</div>
                                <p>“He probado granolas en todo el mundo, pero la textura del coco tostado de Maku es de otra dimensión. Es <strong>artesanía pura</strong> en cada bocado.”</p>
                                <span className="maku-t-author">— Sofía M.</span>
                            </div>

                            {/* Tarjeta 3 */}
                            <div className="maku-t-card" data-aos="zoom-in" data-aos-delay="200">
                                <div className="maku-t-rating">★★★★★</div>
                                <p>“La miel es de verdad. Se nota en el brillo y el aroma cuando abres el frasco.”</p>
                                <span className="maku-t-author">— Juan P.</span>
                            </div>

                            {/* Tarjeta 4 */}
                            <div className="maku-t-card" data-aos="zoom-in" data-aos-delay="300">
                                <div className="maku-t-rating">★★★★★</div>
                                <p>“¿Saben qué es lo peor? Que ahora mi hijo no quiere las otras. Me sale caro el gusto.”</p>
                                <span className="maku-t-author">— Camilo R.</span>
                            </div>

                            {/* Tarjeta 5 (Nueva) */}
                            <div className="maku-t-card" data-aos="zoom-in" data-aos-delay="400">
                                <div className="maku-t-rating">★★★★★</div>
                                <p>“Es fascinante cómo un producto tan saludable puede ser tan sofisticado al paladar. En casa, <strong>Maku ya es un esencial</strong> de nuestra despensa.”</p>
                                <span className="maku-t-author">— @vegan_vibe</span>
                            </div>

                            {/* Tarjeta 6 (Nueva) */}
                            <div className="maku-t-card" data-aos="zoom-in" data-aos-delay="500">
                                <div className="maku-t-rating">★★★★★</div>
                                <p>“Es el regalo perfecto. Siempre quedo bien cuando llevo un frasco de Maku.”</p>
                                <span className="maku-t-author">— Elena G.</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 7. SECCIÓN FINAL: PRODUCTO */}
                <section id="products" className="maku-section-final">
                    <div className="maku-final-container">
                        <div className="maku-final-grid">
                            {/* Visual: Ahora con un contenedor más amplio */}
                            <div className="maku-final-media" data-aos="zoom-in">
                                <div className="maku-product-bg-circle"></div>
                                <img src={initialImage} alt="Maku Granola" className="maku-main-jar" />
                                <div className="maku-floating-labels">
                                    <span>300g</span>
                                    <span>Premium</span>
                                </div>
                            </div>

                            {/* Info: Espaciado interno mejorado */}
                            <div className="maku-final-info" data-aos="fade-up">
                                <div className="maku-header-group">
                                    <span className="maku-badge-dark">Edición Limitada</span>
                                    <h2 className="maku-title-final">Lleva la experiencia <br /><strong>a tu mesa.</strong></h2>
                                </div>

                                <div className="maku-pricing-card">
                                    <p className="maku-investment-text">Inversión en tu bienestar:</p>
                                    <div className="maku-price-row">
                                        <span className="maku-price-old">$60.000</span>
                                        <span className="maku-price-current">$48.000</span>
                                    </div>
                                </div>

                                <p className="maku-text-details">
                                    Nuestra mezcla maestra: Avena, coco tostado, nueces y miel pura.
                                    Horneamos en lotes pequeños para garantizar que el <strong>crunch</strong> llegue perfecto a tu casa.
                                </p>

                                <div className="maku-action-area">
                                    <a
                                        href="https://wa.me/573106396984?text=Hola!%20Quiero%20pedir%20mi%20Maku"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="maku-btn-final-cta"
                                    >
                                        <span>Pedir por WhatsApp</span>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                                    </a>
                                    <p className="maku-delivery-info">🚚 Despachos inmediatos en Cali</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};