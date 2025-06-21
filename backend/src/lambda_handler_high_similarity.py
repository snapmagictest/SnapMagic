"""
High Similarity Version - Maximum Face Preservation with Nova Canvas
"""

def transform_image_bedrock_max_similarity(prompt: str, image_base64: str, username: str) -> str:
    """
    Maximum face preservation approach with Nova Canvas
    """
    try:
        # Clean the base64 data
        if ',' in image_base64:
            image_base64 = image_base64.split(',')[1]
        
        # Analyze person features
        person_features = analyze_person_features(image_base64)
        
        # Create face-focused prompt
        face_prompt = create_face_focused_prompt(person_features, username)
        
        # Maximum face preservation settings
        payload = {
            "taskType": "IMAGE_VARIATION",
            "imageVariationParams": {
                "text": face_prompt,
                "images": [image_base64],
                "similarityStrength": 0.98  # MAXIMUM similarity for face preservation
            },
            "imageGenerationConfig": {
                "seed": random.randint(0, 858993460),
                "quality": "premium",
                "width": 768,
                "height": 1024,
                "numberOfImages": 1,
                "cfgScale": 2.5  # Very low CFG for minimal changes
            }
        }
        
        # Call Nova Canvas with maximum similarity
        response = bedrock_runtime.invoke_model(
            modelId="amazon.nova-canvas-v1:0",
            body=json.dumps(payload)
        )
        
        # Parse response
        response_body = json.loads(response['body'].read())
        
        if 'images' in response_body and len(response_body['images']) > 0:
            transformed_image = response_body['images'][0]
            logger.info(f"✅ Max similarity figurine created: {len(transformed_image)} characters")
            return transformed_image
        else:
            return "Error: No max similarity figurine returned"
            
    except Exception as e:
        return f"Error: Max similarity generation failed - {str(e)}"

def create_face_focused_prompt(person_features: Dict[str, Any], username: str) -> str:
    """
    Create prompt that emphasizes face preservation
    """
    
    person_desc = build_detailed_face_description(person_features)
    
    # Face-focused prompt
    face_prompt = f"""Action figure of {person_desc} in professional business attire, preserve exact facial features and complexion. Clear blister pack on orange backing with '{username}' text. Tech accessories around figure. Keep original face unchanged."""
    
    return face_prompt
