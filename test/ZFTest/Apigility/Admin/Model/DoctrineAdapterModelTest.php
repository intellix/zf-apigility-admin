<?php
/**
 * @license   http://opensource.org/licenses/BSD-3-Clause BSD-3-Clause
 * @copyright Copyright (c) 2013 Zend Technologies USA Inc. (http://www.zend.com)
 */

namespace ZFTest\Apigility\Admin\Model;

use PHPUnit_Framework_TestCase as TestCase;
use Zend\Config\Writer\PhpArray as ConfigWriter;
use Zend\Stdlib\ArrayUtils;
use ZF\Apigility\Admin\Model\DoctrineAdapterModel;
use ZF\Configuration\ConfigResource;

class DoctrineAdapterModelTest extends TestCase
{
    public function setUp()
    {
        $this->configPath       = sys_get_temp_dir() . '/zf-apigility-admin/config';
        $this->globalConfigPath = $this->configPath . '/global.php';
        $this->localConfigPath  = $this->configPath . '/local.php';
        $this->removeConfigMocks();
        $this->createConfigMocks();
        $this->configWriter     = new ConfigWriter();
    }

    public function tearDown()
    {
        $this->removeConfigMocks();
    }

    public function createConfigMocks()
    {
        if (!is_dir($this->configPath)) {
            mkdir($this->configPath, 0777, true);
        }

        $contents = "<" . "?php\nreturn array();";
        file_put_contents($this->globalConfigPath, $contents);
        file_put_contents($this->localConfigPath, $contents);
    }

    public function removeConfigMocks()
    {
        if (file_exists($this->globalConfigPath)) {
            unlink($this->globalConfigPath);
        }
        if (file_exists($this->localConfigPath)) {
            unlink($this->localConfigPath);
        }
        if (is_dir($this->configPath)) {
            rmdir($this->configPath);
        }
        if (is_dir(dirname($this->configPath))) {
            rmdir(dirname($this->configPath));
        }
    }

    public function createModelFromConfigArrays(array $global, array $local)
    {
        $this->configWriter->toFile($this->globalConfigPath, $global);
        $this->configWriter->toFile($this->localConfigPath, $local);
        $mergedConfig = ArrayUtils::merge($global, $local);
        $globalConfig = new ConfigResource($mergedConfig, $this->globalConfigPath, $this->configWriter);
        $localConfig  = new ConfigResource($mergedConfig, $this->localConfigPath, $this->configWriter);
        return new DoctrineAdapterModel($globalConfig, $localConfig);
    }

    public function assertDoctrineConfigExists($adapterName, array $config)
    {
        $this->assertArrayHasKey('doctrine', $config);
        $this->assertArrayHasKey('connection', $config['doctrine']);
        $this->assertArrayHasKey($adapterName, $config['doctrine']['connection']);
        $this->assertInternalType('array', $config['doctrine']['connection'][$adapterName]);
    }

    public function assertDoctrineConfigEquals(array $expected, $adapterName, array $config)
    {
        $this->assertDoctrineConfigExists($adapterName, $config);
        $config = $config['doctrine']['connection'][$adapterName];
        $this->assertEquals($expected, $config);
    }

    public function assertDoctrineConfigContains(array $expected, $adapterName, array $config)
    {
        $this->assertDbConfigExists($adapterName, $config);
        $config = $config['doctrine']['connection'][$adapterName];
        foreach ($expected as $key => $value) {
            $this->assertArrayHasKey($key, $config);
            $this->assertEquals($value, $config[$key]);
        }
    }

    public function testCreatesBothGlobalAndLocalDoctrineConfigWhenNoneExistedPreviously()
    {
        $toCreate = array(
            'driver' => 'Pdo_Sqlite', 
            'dbname' => __FILE__,
        );
        $model    = $this->createModelFromConfigArrays(array(), array());
        $model->create('ORM\New', $toCreate);

        $global = include($this->globalConfigPath);
        $this->assertDoctrineConfigEquals(array(), 'ORM\New', $global);

        $local  = include($this->localConfigPath);
        $this->assertDoctrineConfigEquals($toCreate, 'ORM\New', $local);
    }

    public function testCreatesNewEntriesInBothGlobalAndLocalDoctrineConfigWhenConfigExistedPreviously()
    {
        $globalSeedConfig = array(
            'doctrine' => array(
                'connection' => array(
                    'ORM\Old' => array(),
                ),
            ),
        );
        $localSeedConfig = array(
            'doctrine' => array(
                'connection' => array(
                    'ORM\Old' => array(
                        'params' => array(
                            'driver'   => 'Pdo_Sqlite',
                            'dbname' => __FILE__,
                        ),
                    ),
                ),
            ),
        );
        $model = $this->createModelFromConfigArrays($globalSeedConfig, $localSeedConfig);
        $model->create('ORM\New', array('params' =>array('driver' => 'Pdo_Sqlite', 'dbname' => __FILE__)));

        $global = include($this->globalConfigPath);
        $this->assertDoctrineConfigEquals(array(), 'ORM\Old', $global);
        $this->assertDoctrineConfigEquals(array(), 'ORM\New', $global);

        $local  = include($this->localConfigPath);
        //print_r($local);
        //exit;
        $this->assertDoctrineConfigEquals($localSeedConfig['doctrine']['connection']['ORM\Old'], 'ORM\Old', $local);
        $this->assertDoctrineConfigEquals($localSeedConfig['doctrine']['connection']['ORM\Old'], 'ORM\New', $local);
    }

    public function testCanRetrieveListOfAllConfiguredAdapters()
    {
        $globalSeedConfig = array(
            'doctrine' => array(
                'connection' => array(
                    'ORM\Old'   => array(),
                    'ORM\New'   => array(),
                    'ORM\Newer' => array(),
                ),
            ),
        );
        $localSeedConfig = array(
            'doctrine' => array(
                'connection' => array(
                    'ORM\Old' => array(
                        'params' => array(
                            'driver'   => 'Pdo_Sqlite',
                            'dbname' => __FILE__,
                        ),
                    ),
                    'ORM\New' => array(
                        'params' => array(
                            'driver'   => 'Pdo_Sqlite',
                            'dbname' => __FILE__,
                        ),
                    ),
                    'ORM\Newer' => array(
                        'params' => array(
                            'driver'   => 'Pdo_Sqlite',
                            'dbname' => __FILE__,
                        ),
                    ),
                ),
            ),
        );
        $model        = $this->createModelFromConfigArrays($globalSeedConfig, $localSeedConfig);
        $adapters     = $model->fetchAll();
        $adapterNames = array();
        foreach ($adapters as $adapter) {
            $this->assertInstanceOf('ZF\Apigility\Admin\Model\DoctrineAdapterEntity', $adapter);
            $adapter = $adapter->getArrayCopy();
            $adapterNames[] = $adapter['adapter_name'];
        }
        $this->assertEquals(array(
            'ORM\Old',
            'ORM\New',
            'ORM\Newer',
        ), $adapterNames);
    }

    public function testCanRetrieveIndividualAdapterDetails()
    {
        $globalSeedConfig = array(
            'doctrine' => array(
                'connection' => array(
                    'ORM\Old'   => array(),
                    'ORM\New'   => array(),
                    'ORM\Newer' => array(),
                ),
            ),
        );
        $localSeedConfig = array(
            'doctrine' => array(
                'connection' => array(
                    'ORM\Old' => array(
                        'params' => array(
                            'driver'   => 'Pdo_Sqlite',
                            'dbname' => __FILE__,
                        )
                    ),
                    'ORM\New' => array(
                        'params' => array(
                            'driver'   => 'Pdo_Sqlite',
                            'dbname' => __FILE__,
                        ),
                    ),
                    'ORM\Newer' => array(
                        'params' => array(
                            'driver'   => 'Pdo_Sqlite',
                            'dbname' => __FILE__,
                        ),
                    ),
                ),
            ),
        );
        $model       = $this->createModelFromConfigArrays($globalSeedConfig, $localSeedConfig);
        $adapter     = $model->fetch('ORM\New');
        $this->assertInstanceOf('ZF\Apigility\Admin\Model\DoctrineAdapterEntity', $adapter);
        $adapter = $adapter->getArrayCopy();
        $this->assertEquals('ORM\New', $adapter['adapter_name']);
        unset($adapter['adapter_name']);
        $this->assertEquals($localSeedConfig['doctrine']['connection']['ORM\New'], $adapter);
    }

    public function testUpdatesLocalDbConfigWhenUpdating()
    {
        $toCreate = array(
            'params' => array (
                'driver' => 'Pdo_Sqlite', 
                'dbname' => __FILE__
            )
        );

        $model    = $this->createModelFromConfigArrays(array(), array());
        $model->create('ORM\New', $toCreate);

        $newConfig = array(
            'params' => array(
                'driver'   => 'Pdo_Mysql',
                'dbname' => 'zf_apigility',
                'usern' => 'username',
                'password' => 'password',
            ),
        );
        $entity = $model->update('ORM\New', $newConfig);

        // Ensure the entity returned from the update is what we expect
        $this->assertInstanceOf('ZF\Apigility\Admin\Model\DoctrineAdapterEntity', $entity);
        $entity = $entity->getArrayCopy();
        $expected = array_merge(array('adapter_name' => 'ORM\New'), $newConfig);
        $this->assertEquals($expected, $entity);

        // Ensure fetching the entity after an update will return what we expect
        $config = include $this->localConfigPath;
        $this->assertDoctrineConfigEquals($newConfig, 'ORM\New', $config);
    }

    public function testRemoveDeletesConfigurationFromBothLocalAndGlobalConfigFiles()
    {
        $toCreate = array(
            'params' => array (
                'driver' => 'Pdo_Sqlite', 
                'dbname' => __FILE__
            )
        );

        $model    = $this->createModelFromConfigArrays(array(), array());
        $model->create('ORM\New', $toCreate);

        $model->remove('ORM\New');
        $global = include $this->globalConfigPath;
        $this->assertArrayNotHasKey('ORM\New', $global['doctrine']['connection']);
        $local = include $this->localConfigPath;
        $this->assertArrayNotHasKey('ORM\New', $local['doctrine']['connection']);
    }
}
