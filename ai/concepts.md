# Concepts

`@teqfw/cfg` will separate configuration loading from configuration consumption. Applications will define their own configuration schema, while TeqFW components receive configuration through the dependency-injection container.

The initial intended source is `.env` files. Secrets and local environment files must not be committed to the package repository.
