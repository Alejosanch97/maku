import React from "react";
import "../Styles/footer.css";

export const Footer = ({ handleManualNav }) => {
    // Función interna por si no quieres pasarla por props
    const scrollToSection = (e, id) => {
        if (handleManualNav) {
            handleManualNav(e, id);
        } else {
            e.preventDefault();
            document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <footer className="maku-footer">
            <div className="maku-footer-container">
                <div className="maku-footer-top">
                    <div className="maku-footer-brand">
                        <h3 className="maku-footer-logo">MAKU <span>GRANOLA</span></h3>
                        <p>Artesanía consciente. Horneado en Bogotá.</p>
                    </div>
                    
                    <div className="maku-footer-links">
                        <div className="maku-footer-col">
                            <h4>Explorar</h4>
                            <div className="maku-link-group">
                                {/* Corregidos para que coincidan con tus IDs del Home */}
                                <a href="#ingredients" onClick={(e) => scrollToSection(e, "ingredients")}>Fórmula</a>
                                <a href="#lifecycle" onClick={(e) => scrollToSection(e, "lifecycle")}>Tu Ciclo</a>
                                <a href="#testimonials" onClick={(e) => scrollToSection(e, "testimonials")}>Comunidad</a>
                            </div>
                        </div>
                        <div className="maku-footer-col">
                            <h4>Contacto</h4>
                            <div className="maku-link-group">
                                <a href="https://wa.me/573106396984" target="_blank" rel="noreferrer">WhatsApp</a>
                                <a href="https://www.instagram.com/makualimentos/" target="_blank" rel="noreferrer">Instagram</a>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="maku-footer-bottom">
                    <p>© 2026 Maku Granola.</p>
                    <p className="maku-tagline">Calidad Premium | Hecho a Mano</p>
                </div>
            </div>
        </footer>
    );
};