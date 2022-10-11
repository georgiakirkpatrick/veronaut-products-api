#To Migrate Down Through Tables
Run 'npm run migrate -- 0'

#To Migrate Up Through Tables
Run 'npm run migrate'

#To Migrate Down to/Up to a Specific Table
Run 'npm run migrate -- XXX' where XXX is the number at the beginning of the table's file name.

<!-- #To Run Seed Files in Terminal

1. Navigate to seeds/
2. Run 'psql -U Georgia -d veronaut_products_api -f "./run-seeds.sh"' -->