#!/data/data/com.termux/files/usr/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=~/suntikpanel/backup
mkdir -p $BACKUP_DIR

# Copy data
cp ~/suntikpanel/users.json $BACKUP_DIR/users_$DATE.json 2>/dev/null
cp ~/suntikpanel/orders.json $BACKUP_DIR/orders_$DATE.json 2>/dev/null
cp ~/suntikpanel/deposits.json $BACKUP_DIR/deposits_$DATE.json 2>/dev/null

# Hapus backup lama (> 30 hari)
find $BACKUP_DIR -name "*.json" -mtime +30 -delete

echo "Backup selesai: $DATE"
