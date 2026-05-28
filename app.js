// Minecraft Bedrock Item Creator - Main Application

// State management
const appState = {
    selectedIcon: null,
    iconData: null,
    components: [],
    enchantments: []
};

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeSectionToggles();
    initializeIconSelection();
    loadFromLocalStorage();
});

// ==================== Section Toggle Functionality ====================
function initializeSectionToggles() {
    const headers = document.querySelectorAll('.section-header');
    headers.forEach(header => {
        header.addEventListener('click', function() {
            const section = this.closest('.section');
            const content = section.querySelector('.section-content');
            
            this.classList.toggle('expanded');
            this.classList.toggle('collapsed');
            content.classList.toggle('show');
        });
    });
}

// ==================== Icon Selection ====================
function initializeIconSelection() {
    const iconOptions = document.querySelectorAll('.icon-option');
    iconOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove previous selection
            document.querySelectorAll('.icon-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            
            // Mark as selected
            this.classList.add('selected');
            
            appState.selectedIcon = this.dataset.icon;
            appState.iconData = this.dataset.texture;
            
            updateIconPreview(this.querySelector('img').src, this.dataset.icon);
        });
    });
}

function handleIconUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        appState.iconData = e.target.result;
        appState.selectedIcon = 'custom_icon';
        
        // Deselect all preset icons
        document.querySelectorAll('.icon-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        
        updateIconPreview(e.target.result, 'Custom Icon');
        saveToLocalStorage();
    };
    reader.readAsDataURL(file);
}

function updateIconPreview(imageSrc, label) {
    const preview = document.getElementById('iconPreview');
    preview.innerHTML = `<img src="${imageSrc}" alt="${label}">`;
    preview.classList.add('has-image');
}

// ==================== Components Management ====================
function addComponent() {
    const componentId = 'component_' + Date.now();
    const component = {
        id: componentId,
        name: '',
        value: ''
    };
    
    appState.components.push(component);
    renderComponent(component);
}

function renderComponent(component) {
    const container = document.getElementById('componentsContainer');
    
    const componentDiv = document.createElement('div');
    componentDiv.className = 'component-item';
    componentDiv.id = component.id;
    componentDiv.innerHTML = `
        <div class="two-column">
            <div class="form-group">
                <label>Component Name</label>
                <input type="text" class="component-name" placeholder="e.g., minecraft:durability" value="${component.name}">
                <div class="help-text">Must start with "minecraft:"</div>
            </div>
            <div class="form-group">
                <label>Component Value (JSON)</label>
                <input type="text" class="component-value" placeholder='{"max_durability": 100}' value="${component.value}">
            </div>
        </div>
        <button class="remove-button" onclick="removeComponent('${component.id}')">Remove Component</button>
    `;
    
    container.appendChild(componentDiv);
    
    // Add event listeners for input changes
    componentDiv.querySelector('.component-name').addEventListener('change', (e) => {
        component.name = e.target.value;
        saveToLocalStorage();
    });
    
    componentDiv.querySelector('.component-value').addEventListener('change', (e) => {
        component.value = e.target.value;
        saveToLocalStorage();
    });
}

function removeComponent(componentId) {
    appState.components = appState.components.filter(c => c.id !== componentId);
    document.getElementById(componentId).remove();
    saveToLocalStorage();
}

// ==================== Enchantments Management ====================
function addEnchantment() {
    const enchantmentId = 'enchantment_' + Date.now();
    const enchantment = {
        id: enchantmentId,
        type: 'sharpness',
        level: 1
    };
    
    appState.enchantments.push(enchantment);
    renderEnchantment(enchantment);
}

function renderEnchantment(enchantment) {
    const container = document.getElementById('enchantmentsContainer');
    
    const enchantmentDiv = document.createElement('div');
    enchantmentDiv.className = 'component-item';
    enchantmentDiv.id = enchantment.id;
    enchantmentDiv.innerHTML = `
        <div class="two-column">
            <div class="form-group">
                <label>Enchantment Type</label>
                <select class="enchantment-type">
                    <option value="sharpness" ${enchantment.type === 'sharpness' ? 'selected' : ''}>Sharpness</option>
                    <option value="efficiency" ${enchantment.type === 'efficiency' ? 'selected' : ''}>Efficiency</option>
                    <option value="protection" ${enchantment.type === 'protection' ? 'selected' : ''}>Protection</option>
                    <option value="fortune" ${enchantment.type === 'fortune' ? 'selected' : ''}>Fortune</option>
                    <option value="unbreaking" ${enchantment.type === 'unbreaking' ? 'selected' : ''}>Unbreaking</option>
                    <option value="knockback" ${enchantment.type === 'knockback' ? 'selected' : ''}>Knockback</option>
                    <option value="fireaspect" ${enchantment.type === 'fireaspect' ? 'selected' : ''}>Fire Aspect</option>
                    <option value="silktouch" ${enchantment.type === 'silktouch' ? 'selected' : ''}>Silk Touch</option>
                </select>
            </div>
            <div class="form-group">
                <label>Level</label>
                <input type="number" class="enchantment-level" min="1" max="5" value="${enchantment.level}">
            </div>
        </div>
        <button class="remove-button" onclick="removeEnchantment('${enchantment.id}')">Remove Enchantment</button>
    `;
    
    container.appendChild(enchantmentDiv);
    
    // Add event listeners
    enchantmentDiv.querySelector('.enchantment-type').addEventListener('change', (e) => {
        enchantment.type = e.target.value;
        saveToLocalStorage();
    });
    
    enchantmentDiv.querySelector('.enchantment-level').addEventListener('change', (e) => {
        enchantment.level = parseInt(e.target.value);
        saveToLocalStorage();
    });
}

function removeEnchantment(enchantmentId) {
    appState.enchantments = appState.enchantments.filter(e => e.id !== enchantmentId);
    document.getElementById(enchantmentId).remove();
    saveToLocalStorage();
}

// ==================== Form Data Retrieval ====================
function getFormData() {
    const data = {
        itemName: document.getElementById('itemName').value.trim(),
        namespace: document.getElementById('namespace').value.trim(),
        displayName: document.getElementById('displayName').value.trim(),
        category: document.getElementById('category').value,
        lore: document.getElementById('lore').value.trim(),
        itemType: document.getElementById('itemType').value,
        maxStackSize: parseInt(document.getElementById('maxStackSize').value),
        useDuration: parseInt(document.getElementById('useDuration').value),
        damage: parseInt(document.getElementById('damage').value),
        durability: parseInt(document.getElementById('durability').value),
        cooldown: parseInt(document.getElementById('cooldown').value),
        handEquipped: document.getElementById('handEquipped').checked,
        canAlwaysEat: document.getElementById('canAlwaysEat').checked,
        nutrition: parseInt(document.getElementById('nutrition').value),
        saturationModifier: parseFloat(document.getElementById('saturationModifier').value),
        selectedIcon: appState.selectedIcon,
        iconData: appState.iconData,
        components: appState.components,
        enchantments: appState.enchantments
    };
    
    return data;
}

function validateFormData(data) {
    const errors = [];
    
    if (!data.itemName || data.itemName.length === 0) {
        errors.push('Item Name is required');
    }
    
    if (!data.namespace || data.namespace.length === 0) {
        errors.push('Namespace is required');
    }
    
    if (!/^[a-z0-9_]+$/.test(data.namespace)) {
        errors.push('Namespace must contain only lowercase letters, numbers, and underscores');
    }
    
    if (!data.displayName || data.displayName.length === 0) {
        errors.push('Display Name is required');
    }
    
    if (!data.selectedIcon) {
        errors.push('Please select or upload an icon');
    }
    
    return errors;
}

// ==================== Export to .mcaddon ====================
function exportToMcaddon() {
    const data = getFormData();
    const errors = validateFormData(data);
    
    if (errors.length > 0) {
        showStatus('Error: ' + errors.join(', '), 'error');
        return;
    }
    
    try {
        // Use JSZip library for creating zip files
        if (typeof JSZip === 'undefined') {
            loadJSZip(() => performExport(data));
        } else {
            performExport(data);
        }
    } catch (error) {
        showStatus('Export failed: ' + error.message, 'error');
    }
}

function loadJSZip(callback) {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
    script.onload = callback;
    script.onerror = () => {
        showStatus('Failed to load ZIP library', 'error');
    };
    document.head.appendChild(script);
}

function performExport(data) {
    const zip = new JSZip();
    
    // ===== BEHAVIOR PACK =====
    const behaviorPack = zip.folder('behavior_pack');
    
    // Behavior pack manifest
    const behaviorManifest = {
        "format_version": 2,
        "header": {
            "description": `Custom item pack - ${data.displayName}`,
            "name": `${data.namespace}_behavior`,
            "uuid": generateUUID(),
            "version": [1, 0, 0],
            "min_engine_version": [1, 20, 0]
        },
        "modules": [
            {
                "description": "Item definitions",
                "type": "data",
                "uuid": generateUUID(),
                "version": [1, 0, 0]
            }
        ]
    };
    behaviorPack.file('manifest.json', JSON.stringify(behaviorManifest, null, 2));
    
    // Item JSON file for behavior pack
    const itemComponents = buildItemComponents(data);
    const itemJson = {
        "format_version": "1.20.0",
        "minecraft:item": {
            "description": {
                "identifier": `${data.namespace}:${data.itemName}`,
                "category": data.category,
                "is_experimental": false
            },
            "components": itemComponents
        }
    };
    behaviorPack.folder('items').file(`${data.itemName}.json`, JSON.stringify(itemJson, null, 2));
    
    // ===== RESOURCE PACK =====
    const resourcePack = zip.folder('resource_pack');
    
    // Resource pack manifest
    const resourceManifest = {
        "format_version": 2,
        "header": {
            "description": `Custom item textures - ${data.displayName}`,
            "name": `${data.namespace}_resource`,
            "uuid": generateUUID(),
            "version": [1, 0, 0],
            "min_engine_version": [1, 20, 0]
        },
        "modules": [
            {
                "description": "Item textures",
                "type": "resources",
                "uuid": generateUUID(),
                "version": [1, 0, 0]
            }
        ]
    };
    resourcePack.file('manifest.json', JSON.stringify(resourceManifest, null, 2));
    
    // Language file
    const langContent = `item.${data.namespace}.${data.itemName}.name=${data.displayName}`;
    resourcePack.folder('texts').file('en_US.lang', langContent);
    
    // Icon/Texture
    if (data.iconData) {
        if (data.iconData.startsWith('data:')) {
            // Base64 encoded image
            const base64Data = data.iconData.split(',')[1];
            resourcePack.folder('textures').folder('items').file(`${data.itemName}.png`, base64Data, { base64: true });
        } else {
            // Create a placeholder texture
            resourcePack.folder('textures').folder('items').file(`${data.itemName}.png`, createPlaceholderTexture(), { base64: true });
        }
    }
    
    // Generate the zip file
    zip.generateAsync({ type: 'blob' }).then(blob => {
        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${data.namespace}_${data.itemName}.mcaddon`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        showStatus(`✅ Successfully exported ${data.displayName} as .mcaddon!`, 'success');
        saveToLocalStorage();
    }).catch(error => {
        showStatus('Failed to generate file: ' + error.message, 'error');
    });
}

function buildItemComponents(data) {
    const components = {
        "minecraft:icon": `textures/items/${data.itemName}`,
        "minecraft:max_stack_size": data.maxStackSize
    };
    
    if (data.useDuration > 0) {
        components["minecraft:use_duration"] = data.useDuration;
    }
    
    if (data.handEquipped) {
        components["minecraft:hand_equipped"] = true;
    }
    
    if (data.damage > 0) {
        components["minecraft:weapon"] = {
            "damage": data.damage
        };
    }
    
    if (data.durability > 0) {
        components["minecraft:durability"] = {
            "max_durability": data.durability
        };
    }
    
    if (data.cooldown > 0) {
        components["minecraft:cooldown"] = {
            "category": "item.use",
            "duration": data.cooldown
        };
    }
    
    if (data.nutrition > 0) {
        components["minecraft:food"] = {
            "nutrition": data.nutrition,
            "saturation_modifier": data.saturationModifier,
            "can_always_eat": data.canAlwaysEat
        };
    }
    
    // Add custom components
    data.components.forEach(comp => {
        if (comp.name && comp.value) {
            try {
                components[comp.name] = JSON.parse(comp.value);
            } catch (e) {
                console.warn(`Invalid JSON for component ${comp.name}:`, comp.value);
            }
        }
    });
    
    // Add enchantments
    if (data.enchantments.length > 0) {
        components["minecraft:enchantable"] = {
            "slots": ["weapon.mainhand", "weapon.offhand"],
            "value": 10
        };
    }
    
    return components;
}

// ==================== Utility Functions ====================
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function createPlaceholderTexture() {
    // Create a simple 16x16 PNG placeholder
    // This is a minimal PNG in base64
    return 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
}

function showStatus(message, type) {
    const statusDiv = document.getElementById('statusMessage');
    statusDiv.textContent = message;
    statusDiv.className = `status-message show ${type}`;
    
    setTimeout(() => {
        statusDiv.classList.remove('show');
    }, 5000);
}

function resetForm() {
    if (confirm('Are you sure you want to reset the entire form? This cannot be undone.')) {
        document.getElementById('itemName').value = 'my_custom_item';
        document.getElementById('namespace').value = 'mymod';
        document.getElementById('displayName').value = 'My Custom Item';
        document.getElementById('category').value = 'Misc';
        document.getElementById('lore').value = '';
        document.getElementById('itemType').value = 'misc';
        document.getElementById('maxStackSize').value = 64;
        document.getElementById('useDuration').value = 0;
        document.getElementById('damage').value = 0;
        document.getElementById('durability').value = 0;
        document.getElementById('cooldown').value = 0;
        document.getElementById('handEquipped').checked = false;
        document.getElementById('canAlwaysEat').checked = false;
        document.getElementById('nutrition').value = 0;
        document.getElementById('saturationModifier').value = 0;
        document.getElementById('customIcon').value = '';
        
        // Clear components and enchantments
        appState.components = [];
        appState.enchantments = [];
        appState.selectedIcon = null;
        appState.iconData = null;
        
        document.getElementById('componentsContainer').innerHTML = '';
        document.getElementById('enchantmentsContainer').innerHTML = '';
        
        document.querySelectorAll('.icon-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        
        document.getElementById('iconPreview').innerHTML = 'No icon selected';
        document.getElementById('iconPreview').classList.remove('has-image');
        
        localStorage.removeItem('minecraftItemCreatorData');
        showStatus('Form reset to defaults', 'success');
    }
}

// ==================== Local Storage ====================
function saveToLocalStorage() {
    const data = getFormData();
    localStorage.setItem('minecraftItemCreatorData', JSON.stringify(data));
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem('minecraftItemCreatorData');
    if (!saved) return;
    
    try {
        const data = JSON.parse(saved);
        
        // Load basic fields
        document.getElementById('itemName').value = data.itemName || 'my_custom_item';
        document.getElementById('namespace').value = data.namespace || 'mymod';
        document.getElementById('displayName').value = data.displayName || 'My Custom Item';
        document.getElementById('category').value = data.category || 'Misc';
        document.getElementById('lore').value = data.lore || '';
        document.getElementById('itemType').value = data.itemType || 'misc';
        document.getElementById('maxStackSize').value = data.maxStackSize || 64;
        document.getElementById('useDuration').value = data.useDuration || 0;
        document.getElementById('damage').value = data.damage || 0;
        document.getElementById('durability').value = data.durability || 0;
        document.getElementById('cooldown').value = data.cooldown || 0;
        document.getElementById('handEquipped').checked = data.handEquipped || false;
        document.getElementById('canAlwaysEat').checked = data.canAlwaysEat || false;
        document.getElementById('nutrition').value = data.nutrition || 0;
        document.getElementById('saturationModifier').value = data.saturationModifier || 0;
        
        // Load components
        if (data.components && Array.isArray(data.components)) {
            appState.components = data.components;
            data.components.forEach(comp => renderComponent(comp));
        }
        
        // Load enchantments
        if (data.enchantments && Array.isArray(data.enchantments)) {
            appState.enchantments = data.enchantments;
            data.enchantments.forEach(ench => renderEnchantment(ench));
        }
        
        // Load icon selection
        if (data.selectedIcon) {
            appState.selectedIcon = data.selectedIcon;
            if (data.iconData) {
                appState.iconData = data.iconData;
                updateIconPreview(data.iconData, data.selectedIcon);
            }
            
            const iconOption = document.querySelector(`[data-icon="${data.selectedIcon}"]`);
            if (iconOption) {
                iconOption.classList.add('selected');
            }
        }
    } catch (error) {
        console.error('Failed to load saved data:', error);
    }
}

// Auto-save on input changes
document.addEventListener('change', function(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
        saveToLocalStorage();
    }
});
