import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/store.css";

const API_URL = "https://script.google.com/macros/s/AKfycbxzNjE6JQ7VjSZgVFq2BAODut7PndkpQ6anzRzRY_Y_aAeTIY7FmP6erm3UWDzonrql/exec";

export const Store = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem("maku_cart");
        return savedCart ? JSON.parse(savedCart) : [];
    });
    const [isCartOpen, setIsCartOpen] = useState(false);
    const navigate = useNavigate();

    // Guardar carrito automáticamente cuando cambie
    useEffect(() => {
        localStorage.setItem("maku_cart", JSON.stringify(cart));
    }, [cart]);

    // CORRECCIÓN: Bloquear scroll del body cuando el carrito está abierto
    useEffect(() => {
        if (isCartOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
        return () => { document.body.style.overflow = "auto"; };
    }, [isCartOpen]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = await fetch(API_URL);
                const data = await response.json();
                const sanitizedData = Array.isArray(data) ? data : (data.products || []);
                setProducts(sanitizedData);
            } catch (err) {
                setError("No pudimos cargar el catálogo de Maku.");
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const addToCart = (product) => {
        setCart(prev => {
            const productId = product.id || product.nombre_producto;
            const existing = prev.find(item => (item.id || item.nombre_producto) === productId);
            
            if (existing) {
                return prev.map(item => (item.id || item.nombre_producto) === productId 
                    ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, { ...product, quantity: 1 }];
        });
        setIsCartOpen(true); 
    };

    const updateQuantity = (productId, amount) => {
        setCart(prev => prev.map(item => {
            const id = item.id || item.nombre_producto;
            if (id === productId) {
                const newQty = item.quantity + amount;
                return newQty > 0 ? { ...item, quantity: newQty } : item;
            }
            return item;
        }));
    };

    const removeFromCart = (productId) => {
        setCart(prev => prev.filter(item => (item.id || item.nombre_producto) !== productId));
    };

    const calculateTotal = () => cart.reduce((total, item) => {
        const price = Number(item.precio_rebajado) > 0 ? Number(item.precio_rebajado) : Number(item.precio || 0);
        return total + (price * item.quantity);
    }, 0);

    const sendWhatsApp = () => {
        const baseMsg = "✨ *NUEVO PEDIDO - MERCADO MAKU* ✨\n\nHola! Me gustaría encargar los siguientes productos:\n\n";
        const itemsMsg = cart.map(item => {
            const price = Number(item.precio_rebajado) > 0 ? Number(item.precio_rebajado) : Number(item.precio || 0);
            return `🔸 *${item.nombre_producto}*\n   Cant: ${item.quantity} x $${price.toLocaleString()}\n   Subtotal: $${(price * item.quantity).toLocaleString()}\n`;
        }).join("\n");
        const totalMsg = `\n━━━━━━━━━━━━━━━\n💰 *TOTAL DEL PEDIDO: $${calculateTotal().toLocaleString()}*`;
        const phoneNumber = "573106396984"; 
        const finalUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(baseMsg + itemsMsg + totalMsg)}`;
        window.open(finalUrl, "_blank");
    };

    if (loading) return (
        <div className="maku-loader-overlay">
            <div className="loader-content">
                <div className="maku-spinning-circle"></div>
                <h2 className="loader-text">Cocinando tu pedido<span>...</span></h2>
                <p className="loader-sub">CALIDAD PREMIUM | HECHO A MANO</p>
            </div>
        </div>
    );

    return (
        <div className="maku-store-premium">
            <button className="back-nav-button" onClick={() => navigate("/")}>
                <span className="back-icon">←</span> Volver al inicio
            </button>

            <header className="store-header">
                <span className="store-pretitle">Catálogo Exclusivo</span>
                <h1 className="store-title">MERCADO <span>MAKU</span></h1>
                <p className="store-tagline">Artesanía nutricional directamente a tu mesa.</p>
            </header>

            <div className="product-grid-premium">
                {products.map((prod, idx) => {
                    const hasDiscount = Number(prod.precio_rebajado) > 0;
                    return (
                        <div key={prod.id || idx} className="product-card-glass">
                            <div className="product-image-wrapper">
                                {prod.etiqueta && <span className="product-badge">{prod.etiqueta}</span>}
                                <img src={prod.imagen_url} alt={prod.nombre_producto} />
                                <div className="product-overlay-action">
                                    <button onClick={() => addToCart(prod)} className="btn-add-quick">
                                        + Añadir al Ritual
                                    </button>
                                </div>
                            </div>
                            <div className="product-info-premium">
                                <span className="product-cat">{prod.categoria}</span>
                                <h3>{prod.nombre_producto}</h3>
                                <p className="product-weight">{prod.peso}</p>
                                <div className="product-price-box">
                                    {hasDiscount && (
                                        <span className="old-price" style={{ textDecoration: 'line-through', opacity: 0.4, marginRight: '10px', fontSize: '14px' }}>
                                            ${Number(prod.precio).toLocaleString()}
                                        </span>
                                    )}
                                    <span className="current-price">
                                        ${hasDiscount ? Number(prod.precio_rebajado).toLocaleString() : Number(prod.precio).toLocaleString()}
                                    </span>
                                </div>
                                {/* CORRECCIÓN: Botón móvil habilitado y sin display: none */}
                                <button onClick={() => addToCart(prod)} className="mobile-add-btn">
                                    Añadir al Ritual
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* PANEL DEL CARRITO LATERAL */}
            <div className={`maku-cart-panel ${isCartOpen ? "is-open" : ""}`}>
                <div className="cart-inner">
                    <div className="cart-header">
                        <h4>TU RITUAL</h4>
                        <button className="close-cart-btn" onClick={() => setIsCartOpen(false)}>✕</button>
                    </div>

                    <div className="cart-items-list" style={{ flex: 1, overflowY: 'auto' }}>
                        {cart.length === 0 ? (
                            <div style={{ textAlign: 'center', marginTop: '60px' }}>
                                <p style={{ opacity: 0.5 }}>Aún no has iniciado tu ritual.</p>
                                <button onClick={() => setIsCartOpen(false)} style={{ color: '#A67C52', background: 'none', border: 'none', marginTop: '10px', textDecoration: 'underline', cursor: 'pointer' }}>Explorar sabores</button>
                            </div>
                        ) : (
                            cart.map((item) => {
                                const itemPrice = Number(item.precio_rebajado) > 0 ? Number(item.precio_rebajado) : Number(item.precio);
                                const itemId = item.id || item.nombre_producto;
                                return (
                                    <div key={itemId} className="cart-item-row">
                                        <div className="item-details">
                                            <span className="item-name">{item.nombre_producto}</span>
                                            <div className="qty-controls">
                                                <button onClick={() => updateQuantity(itemId, -1)}>-</button>
                                                <span className="item-qty">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(itemId, 1)}>+</button>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                            <span className="item-price">${(itemPrice * item.quantity).toLocaleString()}</span>
                                            <button 
                                                onClick={() => removeFromCart(itemId)}
                                                className="remove-item-link"
                                                style={{ background: 'none', border: 'none', color: '#ff4444', fontSize: '11px', cursor: 'pointer', marginTop: '8px' }}
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {cart.length > 0 && (
                        <div className="cart-footer">
                            <div className="total-row">
                                <span>TOTAL ESTIMADO</span>
                                <span className="total-amount">
                                    ${calculateTotal().toLocaleString()}
                                </span>
                            </div>
                            <button className="btn-whatsapp-checkout" onClick={sendWhatsApp}>
                                PEDIR POR WHATSAPP
                            </button>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Botón flotante siempre accesible */}
            {cart.length > 0 && (
                <button className="cart-reopen-btn" onClick={() => setIsCartOpen(true)}>
                    <span className="cart-badge-count">
                        {cart.reduce((acc, curr) => acc + curr.quantity, 0)}
                    </span>
                    <span role="img" aria-label="cart">🛒</span>
                </button>
            )}
        </div>
    );
};