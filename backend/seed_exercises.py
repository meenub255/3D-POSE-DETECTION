import asyncio
import sys
import os

# Add the current directory to path so we can import app
sys.path.append(os.getcwd())

from app.db.session import AsyncSessionLocal
from app.models.exercise import Exercise
from sqlalchemy import select

EXERCISES = [
    {
        "name": "Chin Tucks",
        "description": "A simple exercise to strengthen neck muscles and correct forward head posture.",
        "category": "strengthening",
        "difficulty": "beginner",
        "target_areas": ["neck", "upper back"],
        "instructions": [
            "Sit or stand tall, looking straight ahead.",
            "Gently tuck your chin in, as if making a double chin.",
            "Keep your head level; don't look down.",
            "Hold for 3-5 seconds, then relax.",
            "Repeat 10 times."
        ],
        "duration_minutes": 5,
        "repetitions": 10,
        "sets": 3,
        "tags": ["forward_head", "neck_pain", "posture"]
    },
    {
        "name": "Wall Chest Stretch",
        "description": "Opens up the chest and shoulders to combat rounded shoulders and 'computer posture'.",
        "category": "stretching",
        "difficulty": "beginner",
        "target_areas": ["chest", "shoulders"],
        "instructions": [
            "Stand next to a wall or doorway.",
            "Place your forearm on the wall with your elbow at shoulder height.",
            "Gently step forward and turn your body away from the wall.",
            "Hold the stretch for 30 seconds on each side."
        ],
        "duration_minutes": 3,
        "repetitions": 1,
        "sets": 3,
        "tags": ["rounded_shoulders", "chest_tightness"]
    },
    {
        "name": "Cat-Cow Stretch",
        "description": "Improves spinal mobility and relieves tension in the back.",
        "category": "mobility",
        "difficulty": "beginner",
        "target_areas": ["spine", "lower back", "neck"],
        "instructions": [
            "Start on your hands and knees in a tabletop position.",
            "Inhale, drop your belly towards the mat, and look up (Cow).",
            "Exhale, round your back towards the ceiling, and tuck your chin (Cat).",
            "Flow between the two movements for 10-15 breaths."
        ],
        "duration_minutes": 5,
        "repetitions": 15,
        "sets": 2,
        "tags": ["mobility", "spine", "back_pain"]
    },
    {
        "name": "Scapular Squeezes",
        "description": "Strengthens the muscles between the shoulder blades to improve posture and reduce kyphosis.",
        "category": "strengthening",
        "difficulty": "beginner",
        "target_areas": ["upper back", "shoulders"],
        "instructions": [
            "Sit or stand with your arms by your sides.",
            "Squeeze your shoulder blades together as if trying to hold a pencil between them.",
            "Hold for 5 seconds.",
            "Relax and repeat 10-15 times."
        ],
        "duration_minutes": 5,
        "repetitions": 12,
        "sets": 3,
        "tags": ["rounded_shoulders", "kyphosis", "upper_back"]
    }
]

from loguru import logger

async def seed_exercises():
    logger.info("🌱 Seeding exercises...")
    async with AsyncSessionLocal() as session:
        for ex_data in EXERCISES:
            # Check if exercise already exists
            result = await session.execute(
                select(Exercise).where(Exercise.name == ex_data["name"])
            )
            if result.scalar_one_or_none():
                logger.info(f"ℹ️ Exercise '{ex_data['name']}' already exists. Skipping.")
                continue
            
            new_ex = Exercise(**ex_data)
            session.add(new_ex)
            logger.success(f"✅ Added exercise: {ex_data['name']}")
        
        await session.commit()
    logger.info("✨ Seeding complete!")

if __name__ == "__main__":
    asyncio.run(seed_exercises())
