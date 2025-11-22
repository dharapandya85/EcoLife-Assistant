
ADVANCED_WASTE_CATEGORIES = {
    'recyclable_paper': {
        'name': 'Paper & Cardboard',
        'subcategories': ['newspaper', 'cardboard', 'office_paper', 'magazines', 'paper_bags'],
        'disposal_instructions': 'Keep dry and clean, flatten boxes',
        'recycling_code': 'PAP',
        'contamination_warnings': ['no_greasy_pizza_boxes', 'no_waxed_paper']
    },
    'recyclable_plastic': {
        'name': 'Plastic Containers',
        'subcategories': ['pet_bottles', 'hdpe_containers', 'plastic_bottles', 'plastic_containers'],
        'disposal_instructions': 'Rinse thoroughly, remove caps',
        'recycling_code': 'PLA',
        'contamination_warnings': ['no_plastic_bags', 'no_styrofoam']
    },
    'recyclable_glass': {
        'name': 'Glass Containers',
        'subcategories': ['clear_glass', 'brown_glass', 'green_glass', 'glass_bottles'],
        'disposal_instructions': 'Rinse and separate by color',
        'recycling_code': 'GL',
        'contamination_warnings': ['no_ceramics', 'no_lightbulbs']
    },
    'recyclable_metal': {
        'name': 'Metal Containers',
        'subcategories': ['aluminum_cans', 'steel_cans', 'metal_lids', 'foil'],
        'disposal_instructions': 'Rinse and flatten if possible',
        'recycling_code': 'MET',
        'contamination_warnings': ['no_electronics', 'no_batteries']
    },
    'organic_food': {
        'name': 'Food Waste',
        'subcategories': ['fruits', 'vegetables', 'leftovers', 'coffee_grounds', 'egg_shells'],
        'disposal_instructions': 'Compost in designated bin',
        'recycling_code': 'ORG',
        'contamination_warnings': ['no_meat', 'no_dairy']
    },
    'organic_yard': {
        'name': 'Yard Waste',
        'subcategories': ['leaves', 'grass', 'branches', 'flowers', 'plants'],
        'disposal_instructions': 'Use yard waste bin or compost',
        'recycling_code': 'YRD',
        'contamination_warnings': ['no_soil', 'no_rocks']
    },
    'landfill_general': {
        'name': 'General Waste',
        'subcategories': ['mixed_materials', 'soiled_items', 'disposable_items'],
        'disposal_instructions': 'Place in landfill bin',
        'recycling_code': 'LND',
        'contamination_warnings': ['try_to_reduce_usage']
    },
    'hazardous': {
        'name': 'Hazardous Materials',
        'subcategories': ['batteries', 'electronics', 'chemicals', 'paints'],
        'disposal_instructions': 'Take to hazardous waste facility',
        'recycling_code': 'HAZ',
        'contamination_warnings': ['do_not_mix_with_regular_trash']
    },
    'e_waste': {
        'name': 'Electronic Waste',
        'subcategories': ['phones', 'laptops', 'cables', 'batteries'],
        'disposal_instructions': 'Recycle at e-waste center',
        'recycling_code': 'EW',
        'contamination_warnings': ['contains_toxic_materials']
    }
}

ECO_TIPS_DATABASE = {
    'recyclable_paper': [
        "Flatten cardboard boxes to save 80% space in recycling bins",
        "Remove plastic windows from envelopes before recycling",
        "Shredded paper should be bagged to prevent mess",
        "Greasy pizza boxes go in compost, not recycling"
    ],
    'recyclable_plastic': [
        "Check resin codes - only #1 (PET) and #2 (HDPE) are widely recyclable",
        "Remove pump dispensers from bottles - they're different plastic",
        "Plastic film and bags require special drop-off recycling",
        "Black plastic is rarely recyclable due to sorting issues"
    ],
    'recyclable_glass': [
        "Glass can be recycled infinitely without quality loss",
        "Separate by color for higher quality recycling",
        "Remove metal lids and corks before recycling",
        "Broken glass should be wrapped and marked for safety"
    ],
    'recyclable_metal': [
        "Aluminum cans are 100% recyclable and save 95% energy",
        "Clean foil can be recycled if balled up to golf-ball size",
        "Aerosol cans are recyclable if completely empty",
        "Scrap metal has high recycling value"
    ],
    'organic_food': [
        "Composting reduces landfill methane by 90%",
        "Use airtight containers to prevent odors and pests",
        "Balance greens (food) with browns (paper, leaves)",
        "Vermicomposting works great for apartments"
    ],
    'hazardous': [
        "One battery can contaminate 30,000 liters of water",
        "Many retailers offer free battery recycling",
        "Never incinerate hazardous materials",
        "Check local household hazardous waste collection days"
    ]
}

def get_eco_tips(waste_type, confidence):
    """Get dynamic eco tips based on waste type and confidence"""
    tips = ECO_TIPS_DATABASE.get(waste_type, [])
    
    if confidence < 0.7:
        tips.append("Consider taking another photo with better lighting for more accurate classification")

    general_tips = [
        "Always check local recycling guidelines as they vary by municipality",
        "When in doubt, throw it out to prevent recycling contamination",
        "Reduce consumption first, then reuse, then recycle",
        "Clean and dry materials improve recycling efficiency"
    ]
    
    return tips + general_tips[:2] 