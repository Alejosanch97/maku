import React, { useEffect, useState, useRef } from "react";
import "../Styles/home.css";

const sections = [
    { id: "hero-section", label: "Inicio" },
    { id: "the-moment", label: "El Momento" },
    { id: "experience", label: "Experiencia" },
    { id: "ingredients", label: "Fórmula" },
    { id: "lifecycle", label: "Tu Ciclo" },
    { id: "testimonials", label: "Comunidad" },
    { id: "products", label: "Pedir" }
];

export const Home = () => {
    const [loaded, setLoaded] = useState(false);
    const [activeSection, setActiveSection] = useState("hero-section");
    const [videoStarted, setVideoStarted] = useState(false);
    const [isVideoFinished, setIsVideoFinished] = useState(false);
    const [scrollPercentage, setScrollPercentage] = useState(0);

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
            // Solo bloqueamos si el video empezó pero no ha terminado
            if (videoStarted && !isVideoFinished && scrollTop >= 800) {
                document.body.style.overflow = "hidden";
                window.scrollTo(0, 800);
            } else {
                document.body.style.overflow = "auto";
            }
        };

        const interval = setInterval(checkLock, 10);
        return () => {
            clearInterval(interval);
            document.body.style.overflow = "auto";
        };
    }, [videoStarted, isVideoFinished]);

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

    return (
        <div className="maku-landing">

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
                                        <button className="cta-minimal-pill">Explorar Sabores</button>
                                        <button className="cta-link-sophisticated">Nuestra Historia <span className="link-line"></span></button>
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
                                <p>Maku no se diseñó en una oficina, se perfeccionó en la cocina de alguien que no encontraba el crunch perfecto. Es el equilibrio entre el tostado artesanal y la frescura de la montaña.</p>
                                <p className="maku-highlight-text">¿Sientes eso? Es el aroma a miel pura y coco inundando tu mañana. Una vez que abres el frasco, tu desayuno nunca volverá a ser el mismo.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. SECCIÓN: EXPERIENCIA */}
                <section id="experience" className="maku-section-experience">
                    <div className="maku-experience-header">
                        <h2 className="maku-title-md">La anatomía de un vicio saludable</h2>
                    </div>
                    <div className="maku-experience-grid">
                        {[
                            { title: "Crunch de Impacto", desc: "Técnica de horneado lento que asegura que el último bocado sea tan crujiente como el primero." },
                            { title: "Dulzura Inteligente", desc: "Miel real caramelizada. Sin jarabes industriales ni picos de azúcar que te agotan." },
                            { title: "Factor Adictivo", desc: "Coco tostado y semillas de calabaza que activan tus sentidos. No sabrás cuándo parar." },
                            { title: "Versatilidad Total", desc: "Perfecta con yogurt, leche vegetal o directo del frasco a media noche." }
                        ].map((card, index) => (
                            <div key={index} className="maku-exp-card">
                                <span className="maku-card-idx">0{index + 1}</span>
                                <h3>{card.title}</h3>
                                <p>{card.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 3. SECCIÓN: FÓRMULA (Ingredientes) */}
                <section id="ingredients" className="maku-section-ingredients">
                    <div className="maku-ingredients-layout">
                        <div className="maku-ing-column">
                            <div className="maku-ing-item">
                                <span className="maku-ing-label">El Cuerpo</span>
                                <h3>Avena de Grano Entero</h3>
                                <p>Horneada hasta alcanzar un dorado ámbar. Fibra pura para conquistar tu día.</p>
                            </div>
                            <div className="maku-ing-item">
                                <span className="maku-ing-label">Toque Tropical</span>
                                <h3>Láminas de Coco</h3>
                                <p>Láminas reales que aportan una textura sedosa y un aroma inigualable.</p>
                            </div>
                        </div>

                        <div className="maku-ing-center">
                            <div className="maku-circle-media">
                                <div className="maku-inner-text">100%<br />Natural</div>
                            </div>
                        </div>

                        <div className="maku-ing-column">
                            <div className="maku-ing-item">
                                <span className="maku-ing-label">El Cerebro</span>
                                <h3>Nuez del Nogal</h3>
                                <p>Grasas saludables y ese toque terroso que equilibra la dulzura de la miel.</p>
                            </div>
                            <div className="maku-ing-item">
                                <span className="maku-ing-label">La Joya Verde</span>
                                <h3>Semillas de Calabaza</h3>
                                <p>Zinc y magnesio en un crunch persistente que redondea cada bocado.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4. SECCIÓN: EL CICLO (Timeline) */}
                <section id="lifecycle" className="maku-section-lifecycle">
                    <h2 className="maku-timeline-title">Tu primera vez con Maku</h2>
                    <div className="maku-timeline-wrapper">
                        {[
                            { time: "00:01", title: "La Intención", desc: "Dices que solo vas a probar un poquito." },
                            { time: "00:05", title: "El Hallazgo", desc: "El primer crunch te vuela la cabeza. El sabor es real." },
                            { time: "00:15", title: "La Negación", desc: "Sirves un segundo plato. 'Mañana entreno más'." },
                            { time: "01:00", title: "La Realidad", desc: "Viendo una serie... el frasco bajó a la mitad." }
                        ].map((step, i) => (
                            <div key={i} className="maku-timeline-step">
                                <span className="maku-time">{step.time}</span>
                                <h4>{step.title}</h4>
                                <p>{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 5. SECCIÓN: TESTIMONIALES */}
                <section id="testimonials" className="maku-section-testimonials">
                    <div className="maku-wall-header">
                        <h2>Confesiones Maku</h2>
                        <p>No lo decimos nosotros, lo dicen los que ya no pueden parar.</p>
                    </div>
                    <div className="maku-testimonials-grid">
                        <div className="maku-t-card">“Compré el frasco grande para el mes. Duró 3 días. Ayuda.” <span>— @caro_fit</span></div>
                        <div className="maku-t-card">“La primera granola que no parece cartón. La miel es de verdad.” <span>— Juan P.</span></div>
                        <div className="maku-t-card">“El coco tostado es otra dimensión. Pesco los trozos.” <span>— Sofía M.</span></div>
                        <div className="maku-t-card">“¿Saben qué es lo peor? Que ahora mi hijo no quiere las otras.” <span>— Camilo R.</span></div>
                    </div>
                </section>

                {/* 7. SECCIÓN FINAL: PRODUCTO */}
                <section id="products" className="maku-section-final">
                    <div className="maku-final-grid">
                        <div className="maku-final-media">
                            <img src={initialImage} alt="Maku Granola" className="maku-main-jar" />
                            <div className="maku-exclusive-badge">Artesanal</div>
                        </div>
                        <div className="maku-final-info">
                            <span className="maku-cat">Granola Premium</span>
                            <h2>Lleva la experiencia <br />a tu mesa.</h2>
                            <div className="maku-price">
                                <span className="maku-old">$42.000</span>
                                <span className="maku-new">$35.000</span>
                            </div>
                            <p className="maku-desc-final">Frasco de 500g. Avena, Coco, Nuez, Semillas de Calabaza y Miel Pura. Horneado hoy, en tu casa mañana.</p>
                            <a
                                href="https://wa.me/573106396984?text=Hola!%20Quiero%20pedir%20mi%20Maku"
                                target="_blank"
                                rel="noreferrer"
                                className="maku-btn-wa"
                            >
                                Pedir por WhatsApp — Envío Inmediato
                            </a>
                            <p className="maku-stock">⚠️ Lotes limitados por semana.</p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};