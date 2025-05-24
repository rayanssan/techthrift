export async function checkProductInterestsAndNotifyClients(product) {
    try {
        // Step 1: Fetch all interests
        const res = await fetch('/ttuser/interests');
        if (!res.ok) {
            console.error('Failed to fetch interests');
            return;
        }

        const interests = await res.json();
        const matchedEmails = new Set();

        // Step 2: Match interests with any matching attribute
        for (const interest of interests) {
            const match =
                (interest.brand && product.brand && interest.brand === product.brand) ||
                (interest.product_model && product.name && product.name.includes(interest.product_model)) ||
                (interest.category && product.category === interest.category) ||
                (interest.max_price && product.price && product.price <= interest.max_price) ||
                (interest.color && product.color && product.color === interest.color) ||
                (interest.graphics_card && product.graphics_card && product.graphics_card === interest.graphics_card) ||
                (interest.os && product.os && product.os === interest.os) ||
                (interest.processor && product.processor && product.processor === interest.processor) ||
                (interest.product_condition && product.product_condition && product.product_condition === interest.product_condition) ||
                (interest.ram_memory && product.ram_memory && product.ram_memory === interest.ram_memory) ||
                (interest.screen && product.screen && product.screen === interest.screen) ||
                (interest.storage && product.storage && product.storage === interest.storage) ||
                (interest.year && product.year && product.year === interest.year);

            if (match) {
                matchedEmails.add(interest.interested_user);
            }
        }

        // Step 3: Fetch and update each matching client
        for (const email of matchedEmails) {
            const clientRes = await fetch(`/ttuser/client/${email}`);
            if (!clientRes.ok) {
                console.warn(`Client fetch failed: ${email}`);
                continue;
            }

            const client = await clientRes.json();
            const updated = {
                unread_notifications: (client.unread_notifications || 0) + 1
            };

            const updateRes = await fetch(`/ttuser/edit/client`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updated)
            });

            if (!updateRes.ok) {
                const err = await updateRes.json();
                console.warn(`Update failed for ${email}:`, err.error);
            }
        }

        console.log(`✅ Interest-based notifications updated for ${matchedEmails.size} clients.`);

    } catch (err) {
        console.error("Error checking product interests:", err.message);
    }
}
