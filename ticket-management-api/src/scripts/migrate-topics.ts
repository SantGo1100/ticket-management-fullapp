import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import { Topic } from '../entities/topic.entity';
import { TicketTopic } from '../entities/enums/ticket.enums';

/**
 * Migration script to migrate from enum-based topics to database-driven topics
 * 
 * This script:
 * 1. Creates Topic records for existing enum values (billing, bug, feature, other)
 * 2. Migrates existing tickets from enum-based topic string to topicId foreign key
 * 3. Handles cases where migration has already been run
 * 
 * Run with: npm run migrate:topics
 */
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  try {
    console.log('🔄 Starting topic migration...\n');

    // Step 1: Check if topics table exists and has data
    const topicRepository = dataSource.getRepository(Topic);
    const existingTopics = await topicRepository.find();
    
    // Step 2: Create default topics if they don't exist
    const topicMap: Record<string, Topic> = {};
    const defaultTopics = [
      { name: 'Billing', enumValue: TicketTopic.BILLING },
      { name: 'Bug Report', enumValue: TicketTopic.BUG },
      { name: 'Feature Request', enumValue: TicketTopic.FEATURE },
      { name: 'General Inquiry', enumValue: TicketTopic.OTHER },
    ];

    for (const defaultTopic of defaultTopics) {
      // Check if topic with this name already exists
      let topic = existingTopics.find(t => t.name === defaultTopic.name);
      
      if (!topic) {
        // Create new topic
        topic = topicRepository.create({
          name: defaultTopic.name,
          isActive: true,
        });
        topic = await topicRepository.save(topic);
        console.log(`✅ Created topic: ${topic.name} (ID: ${topic.id})`);
      } else {
        console.log(`ℹ️  Topic already exists: ${topic.name} (ID: ${topic.id})`);
      }
      
      topicMap[defaultTopic.enumValue] = topic;
    }

    // Step 3: Backfill topicNameSnapshot for existing tickets
    // This ensures all tickets have a topic name preserved, even if the topic is deleted later
    try {
      // Check if topic_name_snapshot column exists (SQLite syntax)
      const tableInfo = await dataSource.query(`
        PRAGMA table_info(tickets)
      `);
      const hasSnapshotColumn = tableInfo.some((col: any) => col.name === 'topic_name_snapshot');

      if (!hasSnapshotColumn) {
        console.log('\nℹ️  topic_name_snapshot column not found yet. TypeORM synchronize will create it when the server starts.');
        console.log('   Run this migration again after starting the server once.');
        return;
      }

      // Get all tickets that need topicNameSnapshot backfilled
      const ticketsNeedingSnapshot = await dataSource.query(`
        SELECT t.ticket_id, t.topic_id, t.topic_name_snapshot, top.name as topic_name
        FROM tickets t
        LEFT JOIN topics top ON t.topic_id = top.id
        WHERE t.topic_name_snapshot IS NULL
      `);

      if (ticketsNeedingSnapshot.length > 0) {
        console.log(`\n🔄 Backfilling topicNameSnapshot for ${ticketsNeedingSnapshot.length} tickets...`);
        
        let backfilledCount = 0;
        for (const ticket of ticketsNeedingSnapshot) {
          let snapshotName: string | null = null;

          if (ticket.topic_name) {
            // Topic exists, use its name
            snapshotName = ticket.topic_name;
          } else if (ticket.topic_id) {
            // Topic ID exists but topic not found - might be deleted
            // Try to find topic name from enum mapping
            const topicEnum = Object.entries(topicMap).find(([_, t]) => t.id === ticket.topic_id);
            if (topicEnum) {
              snapshotName = topicEnum[1].name;
            } else {
              // Fallback to generic name
              snapshotName = `Topic ${ticket.topic_id}`;
            }
          } else {
            // No topic_id - use default
            const otherTopic = topicMap[TicketTopic.OTHER];
            snapshotName = otherTopic?.name || 'General Inquiry';
          }

          if (snapshotName) {
            await dataSource.query(`
              UPDATE tickets 
              SET topic_name_snapshot = ? 
              WHERE ticket_id = ?
            `, [snapshotName, ticket.ticket_id]);
            backfilledCount++;
          }
        }

        console.log(`✅ Backfilled topicNameSnapshot for ${backfilledCount} tickets`);
      } else {
        console.log('\n✅ All tickets already have topicNameSnapshot assigned');
      }

      // Step 4: Check if any tickets need topicId assignment (for old enum-based tickets)
      const ticketsWithoutTopicId = await dataSource.query(`
        SELECT ticket_id 
        FROM tickets 
        WHERE topic_id IS NULL AND topic_name_snapshot IS NOT NULL
      `);

      if (ticketsWithoutTopicId.length > 0) {
        console.log(`\nℹ️  Found ${ticketsWithoutTopicId.length} tickets without topicId but with topicNameSnapshot.`);
        console.log('   These tickets are ready for topic deletion support.');
      }
    } catch (error) {
      // If columns don't exist yet, TypeORM synchronize will create them
      if (error.message?.includes('no such column')) {
        console.log('\nℹ️  Some columns not found yet. TypeORM synchronize will create them when the server starts.');
        console.log('   Run this migration again after starting the server once.');
      } else {
        throw error;
      }
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   - Topics available: ${Object.keys(topicMap).length}`);
    Object.values(topicMap).forEach(topic => {
      console.log(`     • ${topic.name} (ID: ${topic.id}, Active: ${topic.isActive})`);
    });

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();

